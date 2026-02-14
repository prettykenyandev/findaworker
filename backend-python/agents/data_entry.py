"""
Data Entry & Processing Agent
Handles structured data extraction, validation, transformation, and enrichment
"""
import asyncio
import random
import re
from typing import Dict, Any, List
from agents.base import BaseAgent
from datetime import datetime


FIELD_VALIDATORS = {
    "email": r"^[\w\.-]+@[\w\.-]+\.\w{2,}$",
    "phone": r"^\+?[\d\s\-\(\)]{7,15}$",
    "date": r"^\d{4}-\d{2}-\d{2}$",
    "amount": r"^\$?[\d,]+\.?\d{0,2}$",
    "zip": r"^\d{5}(-\d{4})?$",
}


class DataEntryAgent(BaseAgent):
    def __init__(self, agent_id: str, name: str, config: Dict[str, Any] = None, description: str = ""):
        super().__init__(agent_id, name, "data_entry", config, description or "Extracts, validates, transforms, and enriches structured data")
        self.validation_rules = config.get("validation_rules", {})
        self.output_format = config.get("output_format", "json")
        self.error_threshold = config.get("error_threshold", 0.05)

    async def execute(self, task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        self.current_task = task_type
        
        dispatch = {
            "extract_fields": self._extract_fields,
            "validate_records": self._validate_records,
            "transform_data": self._transform_data,
            "enrich_records": self._enrich_records,
            "deduplicate": self._deduplicate,
            "parse_document": self._parse_document,
        }
        
        handler = dispatch.get(task_type)
        if not handler:
            raise ValueError(f"Unknown task type: {task_type}")
        return await handler(payload)

    async def _extract_fields(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.4, 1.5))
        
        fields = payload.get("fields", ["name", "email", "phone", "address", "amount"])
        source_text = payload.get("text", "")
        
        extracted = {}
        for field in fields:
            # Simulate extraction with varying confidence
            confidence = round(random.uniform(0.6, 1.0), 2)
            extracted[field] = {
                "value": f"<extracted_{field}>",
                "confidence": confidence,
                "extraction_method": random.choice(["regex", "nlp", "ml_model"]),
                "flagged": confidence < 0.75
            }
        
        flagged_count = sum(1 for v in extracted.values() if v["flagged"])
        
        return {
            "extracted_fields": extracted,
            "total_fields": len(fields),
            "high_confidence_fields": len(fields) - flagged_count,
            "flagged_for_review": flagged_count,
            "requires_human_review": flagged_count > len(fields) * self.error_threshold * 10
        }

    async def _validate_records(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.2, 0.8))
        
        records = payload.get("records", [])
        schema = payload.get("schema", {})
        
        valid = []
        invalid = []
        
        for i, record in enumerate(records):
            errors = []
            for field, rules in schema.items():
                value = record.get(field, "")
                if rules.get("required") and not value:
                    errors.append({"field": field, "error": "required_missing"})
                if rules.get("type") == "email" and value:
                    if not re.match(FIELD_VALIDATORS["email"], str(value)):
                        errors.append({"field": field, "error": "invalid_email_format"})
                if rules.get("max_length") and len(str(value)) > rules["max_length"]:
                    errors.append({"field": field, "error": f"exceeds_max_length_{rules['max_length']}"})
            
            if errors:
                invalid.append({"index": i, "record": record, "errors": errors})
            else:
                valid.append(record)
        
        return {
            "total": len(records),
            "valid": len(valid),
            "invalid": len(invalid),
            "validation_rate": round(len(valid) / max(len(records), 1) * 100, 1),
            "errors": invalid[:10],  # Return first 10 errors
            "valid_records": valid
        }

    async def _transform_data(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.3, 1.0))
        
        records = payload.get("records", [])
        transformations = payload.get("transformations", [])
        
        transformed = []
        for record in records:
            new_record = dict(record)
            for transform in transformations:
                field = transform.get("field")
                op = transform.get("operation")
                if field in new_record:
                    if op == "uppercase":
                        new_record[field] = str(new_record[field]).upper()
                    elif op == "lowercase":
                        new_record[field] = str(new_record[field]).lower()
                    elif op == "trim":
                        new_record[field] = str(new_record[field]).strip()
                    elif op == "format_date":
                        new_record[field] = datetime.now().strftime("%Y-%m-%d")
            transformed.append(new_record)
        
        return {
            "transformed_count": len(transformed),
            "transformations_applied": len(transformations),
            "records": transformed,
            "output_format": self.output_format
        }

    async def _enrich_records(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.8, 2.5))
        
        records = payload.get("records", [])
        enrichment_sources = payload.get("sources", ["company_db", "geo_api"])
        
        enriched = []
        for record in records:
            enrichment = {}
            if "company_db" in enrichment_sources:
                enrichment["company_size"] = random.choice(["1-10", "11-50", "51-200", "201-1000", "1000+"])
                enrichment["industry"] = random.choice(["SaaS", "FinTech", "Healthcare", "E-commerce", "Enterprise"])
            if "geo_api" in enrichment_sources:
                enrichment["timezone"] = random.choice(["America/New_York", "Europe/London", "Asia/Tokyo"])
                enrichment["country_code"] = random.choice(["US", "GB", "DE", "FR", "JP"])
            enriched.append({**record, **enrichment})
        
        return {
            "enriched_count": len(enriched),
            "sources_used": enrichment_sources,
            "fields_added": list(enrichment.keys()) if enriched else [],
            "records": enriched
        }

    async def _deduplicate(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(0.3, 1.2))
        
        records = payload.get("records", [])
        key_fields = payload.get("key_fields", ["email"])
        
        seen = set()
        unique = []
        duplicates = []
        
        for record in records:
            key = tuple(str(record.get(f, "")).lower() for f in key_fields)
            if key in seen:
                duplicates.append(record)
            else:
                seen.add(key)
                unique.append(record)
        
        return {
            "total_input": len(records),
            "unique_records": len(unique),
            "duplicates_removed": len(duplicates),
            "dedup_rate": round(len(duplicates) / max(len(records), 1) * 100, 1),
            "records": unique
        }

    async def _parse_document(self, payload: dict) -> dict:
        await asyncio.sleep(random.uniform(1.0, 3.0))
        
        doc_type = payload.get("document_type", "invoice")
        
        parsed_fields = {
            "invoice": ["invoice_number", "date", "vendor", "amount", "tax", "line_items"],
            "contract": ["parties", "effective_date", "term_months", "value", "clauses"],
            "form": ["applicant_name", "date", "fields", "signatures"],
        }
        
        fields = parsed_fields.get(doc_type, ["field_1", "field_2", "field_3"])
        
        return {
            "document_type": doc_type,
            "pages_processed": random.randint(1, 10),
            "fields_extracted": len(fields),
            "extracted_data": {f: f"<parsed_{f}>" for f in fields},
            "confidence_score": round(random.uniform(0.78, 0.98), 2),
            "requires_review": random.random() < 0.15
        }
