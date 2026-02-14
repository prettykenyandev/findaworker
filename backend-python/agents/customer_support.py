"""
Customer Support Agent
Handles ticket triage, response drafting, sentiment analysis, escalation logic
"""
import asyncio
import random
from typing import Dict, Any
from agents.base import BaseAgent


RESPONSE_TEMPLATES = {
    "billing": "Thank you for reaching out about your billing concern. I've reviewed your account and {detail}. Please allow 3-5 business days for the adjustment to reflect.",
    "technical": "I understand you're experiencing a technical issue. I've escalated this to our engineering team with priority level {priority}. You'll receive an update within {eta}.",
    "general": "Thank you for contacting support. I've reviewed your inquiry and {detail}. Is there anything else I can help you with?",
    "refund": "I've processed your refund request for {amount}. You should see the credit within 5-7 business days depending on your bank.",
    "cancel": "I've initiated the cancellation of your account as requested. You'll receive a confirmation email at {email}. Your data will be retained for 30 days.",
}

SOCIAL_RESPONSE_TEMPLATES = {
    "dm": {
        "positive": "Hi {customer_name}! 😊 Thanks for reaching out. {response_body} Feel free to DM us anytime!",
        "neutral": "Hi {customer_name}, thanks for your message. {response_body} Let us know if you need anything else.",
        "negative": "Hi {customer_name}, we're sorry to hear about your experience. {response_body} We've flagged this for our team to look into right away.",
        "frustrated": "Hi {customer_name}, we completely understand your frustration and sincerely apologize. {response_body} A senior team member will follow up with you shortly.",
    },
    "comment": {
        "positive": "Thank you so much for the kind words, {customer_name}! 🙌 We're glad you're enjoying {product}!",
        "neutral": "{customer_name} Thanks for your comment! {response_body}",
        "negative": "We're sorry about this, {customer_name}. We'd love to make it right — please DM us so we can help. 💬",
        "complaint": "We hear you, {customer_name}, and we're taking this seriously. Our team is looking into it. We'll follow up via DM.",
    },
    "review": {
        "positive": "Thank you for the amazing review, {customer_name}! ⭐ We're thrilled you had a great experience with {product}.",
        "neutral": "Thanks for sharing your feedback, {customer_name}. We're always looking to improve — your input helps!",
        "negative": "We're sorry we didn't meet your expectations, {customer_name}. We'd like to make this right. {resolution}",
    },
}

SOCIAL_PLATFORMS = ["twitter", "instagram", "facebook", "tiktok", "linkedin", "threads"]

SOCIAL_ISSUE_TYPES = ["product_complaint", "shipping_delay", "praise", "feature_request", "service_outage", "pricing_question", "general_inquiry"]

SENTIMENT_LABELS = ["positive", "neutral", "negative", "frustrated", "urgent"]

PRIORITY_MAP = {
    "frustrated": "HIGH",
    "urgent": "CRITICAL",
    "negative": "HIGH",
    "neutral": "MEDIUM",
    "positive": "LOW",
}


class CustomerSupportAgent(BaseAgent):
    def __init__(self, agent_id: str, name: str, config: Dict[str, Any] = None, description: str = ""):
        super().__init__(agent_id, name, "customer_support", config, description or "Handles customer tickets, triage, response drafting, and social media customer engagement")
        self.handled_categories = config.get("categories", ["billing", "technical", "general", "refund", "cancel"])
        self.auto_resolve_threshold = config.get("auto_resolve_threshold", 0.85)
        self.escalation_enabled = config.get("escalation_enabled", True)
        self.social_platforms = config.get("social_platforms", SOCIAL_PLATFORMS)
        self.social_auto_reply = config.get("social_auto_reply", True)
        self.social_tone = config.get("social_tone", "friendly")

    async def execute(self, task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        self.current_task = task_type
        
        if task_type == "triage_ticket":
            return await self._triage_ticket(payload)
        elif task_type == "draft_response":
            return await self._draft_response(payload)
        elif task_type == "analyze_sentiment":
            return await self._analyze_sentiment(payload)
        elif task_type == "bulk_classify":
            return await self._bulk_classify(payload)
        elif task_type == "respond_to_dm":
            return await self._respond_to_dm(payload)
        elif task_type == "reply_to_comment":
            return await self._reply_to_comment(payload)
        elif task_type == "handle_review":
            return await self._handle_review(payload)
        elif task_type == "social_monitor":
            return await self._social_monitor(payload)
        else:
            raise ValueError(f"Unknown task type: {task_type}")

    async def _triage_ticket(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.3, 1.2))
        
        ticket_text = payload.get("text", "")
        customer_tier = payload.get("customer_tier", "standard")
        
        # Simulate AI classification
        category = random.choice(self.handled_categories)
        sentiment = random.choice(SENTIMENT_LABELS)
        confidence = round(random.uniform(0.72, 0.99), 2)
        priority = PRIORITY_MAP.get(sentiment, "MEDIUM")
        
        if customer_tier == "enterprise":
            priority = "HIGH" if priority == "MEDIUM" else priority
        
        should_escalate = self.escalation_enabled and (
            sentiment in ("frustrated", "urgent") or confidence < self.auto_resolve_threshold
        )
        
        return {
            "ticket_id": payload.get("ticket_id", "unknown"),
            "category": category,
            "sentiment": sentiment,
            "priority": priority,
            "confidence": confidence,
            "should_escalate": should_escalate,
            "suggested_team": "billing-team" if category == "billing" else "support-tier2" if should_escalate else "support-tier1",
            "estimated_resolution_hours": random.choice([1, 2, 4, 8, 24])
        }

    async def _draft_response(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.5, 1.8))
        
        category = payload.get("category", "general")
        template = RESPONSE_TEMPLATES.get(category, RESPONSE_TEMPLATES["general"])
        
        # Fill template with contextual data
        response = template.format(
            detail="we've applied a courtesy credit of $10.00 to your account" if category == "billing" else "your request has been processed successfully",
            priority="HIGH",
            eta="2 hours",
            amount=payload.get("amount", "$29.99"),
            email=payload.get("email", "customer@example.com")
        )
        
        return {
            "draft": response,
            "category": category,
            "tone": "professional",
            "word_count": len(response.split()),
            "requires_review": random.random() > self.auto_resolve_threshold,
            "personalization_applied": bool(payload.get("customer_name"))
        }

    async def _analyze_sentiment(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.1, 0.4))
        
        sentiment = random.choice(SENTIMENT_LABELS)
        scores = {label: round(random.uniform(0.01, 0.3), 3) for label in SENTIMENT_LABELS}
        scores[sentiment] = round(random.uniform(0.6, 0.95), 3)
        
        return {
            "sentiment": sentiment,
            "scores": scores,
            "urgency_score": round(random.uniform(0, 1), 2),
            "topics_detected": random.sample(["pricing", "performance", "support", "features", "billing", "cancellation"], k=random.randint(1, 3))
        }

    async def _bulk_classify(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.8, 2.5))
        tickets = payload.get("tickets", [])
        results = []
        for ticket in tickets[:50]:  # cap at 50
            results.append({
                "id": ticket.get("id"),
                "category": random.choice(self.handled_categories),
                "priority": random.choice(["LOW", "MEDIUM", "HIGH"]),
                "confidence": round(random.uniform(0.7, 0.99), 2)
            })
        return {"classified": len(results), "results": results}

    # ── Social Media Task Handlers ────────────────────────────────────────────

    async def _respond_to_dm(self, payload: dict) -> dict:
        """Draft a response to a customer direct message on social media."""
        await asyncio.sleep(random.uniform(0.3, 1.5))

        platform = payload.get("platform", "twitter")
        message_text = payload.get("message", "")
        customer_name = payload.get("customer_name", "there")

        # Detect sentiment
        sentiment = random.choice(["positive", "neutral", "negative", "frustrated"])
        issue_type = random.choice(SOCIAL_ISSUE_TYPES)
        confidence = round(random.uniform(0.75, 0.99), 2)

        # Pick response template
        templates = SOCIAL_RESPONSE_TEMPLATES["dm"]
        template = templates.get(sentiment, templates["neutral"])
        response_body = {
            "product_complaint": "We've logged your concern and our product team is reviewing it.",
            "shipping_delay": "We've checked your order and it's now on its way — you should receive a tracking update soon.",
            "praise": "That really made our day!",
            "feature_request": "Great idea! We've passed this along to our product team.",
            "service_outage": "Our engineering team is aware and actively working on a fix.",
            "pricing_question": "You can find our latest pricing at the link in our bio, but happy to walk you through the options here too.",
            "general_inquiry": "We're happy to help with that.",
        }.get(issue_type, "We're looking into this for you.")

        draft = template.format(
            customer_name=customer_name,
            response_body=response_body,
            product="our service",
        )

        should_escalate = sentiment in ("frustrated",) or issue_type == "service_outage"

        return {
            "platform": platform,
            "response_draft": draft,
            "sentiment": sentiment,
            "issue_type": issue_type,
            "confidence": confidence,
            "tone": self.social_tone,
            "auto_send": self.social_auto_reply and confidence >= self.auto_resolve_threshold and not should_escalate,
            "should_escalate": should_escalate,
            "character_count": len(draft),
            "requires_review": should_escalate or confidence < self.auto_resolve_threshold,
        }

    async def _reply_to_comment(self, payload: dict) -> dict:
        """Draft a public reply to a social media comment or mention."""
        await asyncio.sleep(random.uniform(0.2, 1.0))

        platform = payload.get("platform", "instagram")
        comment_text = payload.get("comment", "")
        post_context = payload.get("post_context", "")
        customer_name = payload.get("customer_name", "there")

        sentiment = random.choice(["positive", "neutral", "negative", "complaint"])
        is_public = True
        confidence = round(random.uniform(0.70, 0.99), 2)

        templates = SOCIAL_RESPONSE_TEMPLATES["comment"]
        template = templates.get(sentiment, templates["neutral"])
        draft = template.format(
            customer_name=f"@{customer_name}",
            response_body="We appreciate you taking the time to share this.",
            product=payload.get("product", "our product"),
        )

        # Platform-specific character limits
        char_limits = {"twitter": 280, "tiktok": 150, "instagram": 2200, "facebook": 8000, "linkedin": 3000, "threads": 500}
        limit = char_limits.get(platform, 2200)
        is_truncated = len(draft) > limit
        if is_truncated:
            draft = draft[:limit - 3] + "..."

        return {
            "platform": platform,
            "reply_draft": draft,
            "sentiment": sentiment,
            "is_public": is_public,
            "confidence": confidence,
            "character_count": len(draft),
            "character_limit": limit,
            "truncated": is_truncated,
            "suggest_dm_followup": sentiment in ("negative", "complaint"),
            "requires_review": sentiment in ("negative", "complaint") or confidence < self.auto_resolve_threshold,
        }

    async def _handle_review(self, payload: dict) -> dict:
        """Generate a response to a customer review (e.g., Google, App Store, Yelp)."""
        await asyncio.sleep(random.uniform(0.3, 1.2))

        platform = payload.get("platform", "google")
        review_text = payload.get("review", "")
        star_rating = payload.get("rating", random.randint(1, 5))
        customer_name = payload.get("customer_name", "Valued Customer")

        if star_rating >= 4:
            sentiment = "positive"
        elif star_rating == 3:
            sentiment = "neutral"
        else:
            sentiment = "negative"

        templates = SOCIAL_RESPONSE_TEMPLATES["review"]
        template = templates.get(sentiment, templates["neutral"])
        resolution = random.choice([
            "Please reach out to us directly and we'll make it right.",
            "We've shared your feedback with our team and are working on improvements.",
            "We'd love to offer you a complimentary experience — please DM us.",
        ])

        draft = template.format(
            customer_name=customer_name,
            product=payload.get("product", "our service"),
            resolution=resolution,
        )

        return {
            "platform": platform,
            "star_rating": star_rating,
            "sentiment": sentiment,
            "response_draft": draft,
            "tone": self.social_tone,
            "word_count": len(draft.split()),
            "should_escalate": star_rating <= 2,
            "follow_up_action": "offer_resolution" if star_rating <= 2 else "thank_customer" if star_rating >= 4 else "acknowledge",
            "requires_review": star_rating <= 2,
        }

    async def _social_monitor(self, payload: dict) -> dict:
        """Monitor social media platforms for brand mentions and customer issues."""
        await asyncio.sleep(random.uniform(0.5, 2.0))

        platforms = payload.get("platforms", self.social_platforms)
        brand_name = payload.get("brand_name", "OurBrand")
        time_window_hours = payload.get("time_window_hours", 24)

        # Simulate discovered mentions
        num_mentions = random.randint(5, 40)
        mentions = []
        for i in range(num_mentions):
            plat = random.choice(platforms)
            sent = random.choice(SENTIMENT_LABELS)
            mentions.append({
                "id": f"mention-{i+1}",
                "platform": plat,
                "type": random.choice(["comment", "dm", "mention", "review", "tag"]),
                "sentiment": sent,
                "priority": PRIORITY_MAP.get(sent, "MEDIUM"),
                "issue_type": random.choice(SOCIAL_ISSUE_TYPES),
                "requires_response": random.random() > 0.3,
                "snippet": f"[Simulated {plat} mention about {brand_name}]",
            })

        urgent_count = sum(1 for m in mentions if m["priority"] in ("HIGH", "CRITICAL"))
        needs_response = sum(1 for m in mentions if m["requires_response"])

        sentiment_breakdown = {}
        for m in mentions:
            sentiment_breakdown[m["sentiment"]] = sentiment_breakdown.get(m["sentiment"], 0) + 1

        platform_breakdown = {}
        for m in mentions:
            platform_breakdown[m["platform"]] = platform_breakdown.get(m["platform"], 0) + 1

        return {
            "brand_name": brand_name,
            "time_window_hours": time_window_hours,
            "total_mentions": num_mentions,
            "urgent_mentions": urgent_count,
            "needs_response": needs_response,
            "sentiment_breakdown": sentiment_breakdown,
            "platform_breakdown": platform_breakdown,
            "mentions": mentions[:20],  # return top 20
            "recommended_actions": [
                f"Respond to {urgent_count} urgent mentions immediately",
                f"{needs_response} mentions require a reply",
                f"Overall brand sentiment is mostly {max(sentiment_breakdown, key=sentiment_breakdown.get)}",
            ],
        }
