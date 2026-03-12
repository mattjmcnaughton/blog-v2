import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import { withSpan } from "@/lib/telemetry";

const contentDirectory = path.join(process.cwd(), "content");
const blogDirectory = path.join(contentDirectory, "blog");

export interface BlogPostMeta {
  title: string;
  date: string;
  description: string;
  slug: string;
  tags?: string[];
  draft?: boolean;
  featured?: boolean;
}

export interface AboutPageMeta {
  title: string;
  description: string;
}

export interface NowPageMeta {
  title: string;
  description: string;
  lastUpdated?: string;
}

export interface ProjectsPageMeta {
  title: string;
  description: string;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  return withSpan("markdown.toHtml", async () => {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeHighlight)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(markdown);
    return result.toString();
  });
}

export async function getAboutContent(): Promise<{
  meta: AboutPageMeta;
  content: string;
}> {
  const fullPath = path.join(contentDirectory, "about.md");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const htmlContent = await markdownToHtml(content);
  return {
    meta: data as AboutPageMeta,
    content: htmlContent,
  };
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  return withSpan("blog.getAllPosts", async (span) => {
    if (!fs.existsSync(blogDirectory)) {
      span.setAttribute("blog.post_count", 0);
      return [];
    }

    const fileNames = fs.readdirSync(blogDirectory);
    const posts = await Promise.all(
      fileNames
        .filter((name) => name.endsWith(".md"))
        .map(async (fileName) => {
          const slug = fileName.replace(/\.md$/, "");
          const fullPath = path.join(blogDirectory, fileName);
          const fileContents = fs.readFileSync(fullPath, "utf8");
          const { data } = matter(fileContents);
          return {
            slug,
            title: data.title,
            date: data.date,
            description: data.description,
            tags: data.tags,
            draft: data.draft,
            featured: data.featured,
          } as BlogPostMeta;
        })
    );

    const result = posts.filter((post) => !post.draft).sort(comparePosts);

    span.setAttribute("blog.post_count", result.length);
    return result;
  });
}

export function comparePosts(a: BlogPostMeta, b: BlogPostMeta): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export async function getPostBySlug(slug: string): Promise<{
  meta: BlogPostMeta;
  content: string;
}> {
  return withSpan(
    "blog.getPostBySlug",
    async () => {
      const fullPath = path.join(blogDirectory, `${slug}.md`);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      const htmlContent = await markdownToHtml(content);
      return {
        meta: {
          slug,
          title: data.title,
          date: data.date,
          description: data.description,
          tags: data.tags,
          draft: data.draft,
        } as BlogPostMeta,
        content: htmlContent,
      };
    },
    { "blog.slug": slug }
  );
}

export async function getFeaturedPosts(
  limit: number = 3
): Promise<BlogPostMeta[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.featured).slice(0, limit);
}

export async function getNowContent(): Promise<{
  meta: NowPageMeta;
  content: string;
}> {
  const fullPath = path.join(contentDirectory, "now.md");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const htmlContent = await markdownToHtml(content);
  return {
    meta: data as NowPageMeta,
    content: htmlContent,
  };
}

export async function getProjectsContent(): Promise<{
  meta: ProjectsPageMeta;
  content: string;
}> {
  const fullPath = path.join(contentDirectory, "projects.md");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const htmlContent = await markdownToHtml(content);
  return {
    meta: data as ProjectsPageMeta,
    content: htmlContent,
  };
}
