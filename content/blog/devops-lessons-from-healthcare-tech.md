---
title: "DevOps Lessons from Healthcare Tech"
date: "2020-03-28"
description: "What building infrastructure in a regulated healthcare environment taught me about reliability and compliance."
tags: ["devops", "healthcare", "infrastructure", "compliance"]
---

Spending my early years at Flatiron Health building DevOps solutions for healthcare taught me lessons that I carry with me to this day. Healthcare tech operates under constraints that force you to think differently about reliability and operations.

## Compliance as a Feature

In healthcare, compliance isn't a checkbox - it's a feature. HIPAA, SOC 2, and HITRUST aren't just audits to pass; they're frameworks that, when embraced, lead to genuinely better systems.

```yaml
# Every infrastructure change must be auditable
resource "aws_s3_bucket" "patient_data" {
  bucket = "patient-data-${var.environment}"

  logging {
    target_bucket = aws_s3_bucket.access_logs.id
    target_prefix = "patient-data/"
  }

  versioning {
    enabled = true  # Required for audit trails
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "aws:kms"
        kms_master_key_id = aws_kms_key.patient_data.arn
      }
    }
  }
}
```

## The Four Nines Aren't Enough

When your system supports cancer research, downtime has real consequences. We aimed for five nines (99.999% uptime) for critical paths, which meant:

- Multi-region active-active deployments
- Chaos engineering to find failure modes before they found us
- Runbooks for every imaginable scenario
- On-call rotations that actually worked

## Change Management That Doesn't Slow You Down

The key insight was that good change management actually speeds you up. When you have confidence in your deployment pipeline, you deploy more frequently, not less.

```bash
# Our deployment checklist was automated
./deploy --environment=production \
    --change-ticket=CHG-12345 \
    --rollback-plan=automatic \
    --canary-percentage=5 \
    --promotion-criteria="error_rate < 0.1%"
```

## Key Takeaways

1. **Build compliance in from day one.** Retrofitting is painful and expensive.
2. **Automate everything auditable.** Manual processes introduce errors and slow you down.
3. **Invest in observability.** You can't fix what you can't see, and in healthcare, you need to see everything.
4. **Practice incident response.** Regular game days made real incidents routine rather than panic-inducing.

These lessons transfer surprisingly well to any domain where reliability matters. Healthcare just has higher stakes that force you to get it right.
