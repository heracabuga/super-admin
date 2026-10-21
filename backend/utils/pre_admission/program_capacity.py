import re

def _to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _build_course_pattern(course_name_or_obj):
    if not course_name_or_obj:
        return None
    candidates = []
    if isinstance(course_name_or_obj, dict):
        name = str(course_name_or_obj.get("name") or "").strip()
        abbr = str(course_name_or_obj.get("abbreviation") or course_name_or_obj.get("code") or "").strip()
        if name:
            candidates.append(name)
            if " - " in name:
                candidates.extend([p.strip() for p in name.split(" - ") if p.strip()])
        if abbr:
            candidates.append(abbr)
        if name and abbr:
            candidates.append(f"{abbr} - {name}")
    else:
        c_str = str(course_name_or_obj).strip()
        candidates.append(c_str)
        if " - " in c_str:
            candidates.extend([p.strip() for p in c_str.split(" - ") if p.strip()])

    unique_candidates = [c for c in set(candidates) if c]
    if not unique_candidates:
        return None
    escaped = "|".join(re.escape(c) for c in unique_candidates)
    return re.compile(f"^({escaped})$", re.IGNORECASE)


def _build_course_match_query(course_pattern):
    return {
        "$or": [
            {"activeProgram": course_pattern},
            {"reassignedProgram": course_pattern},
            {"reconsiderationProgram": course_pattern},
            {
                "firstChoice": course_pattern,
                "isRejectedFirstChoice": {"$ne": True},
                "reconsiderationProgram": {"$in": [None, ""]},
                "reassignedProgram": {"$in": [None, ""]},
                "activeProgram": {"$in": [None, ""]}
            },
            {
                "secondChoice": course_pattern,
                "isRejectedFirstChoice": True,
                "reconsiderationProgram": {"$in": [None, ""]},
                "reassignedProgram": {"$in": [None, ""]},
                "activeProgram": {"$in": [None, ""]}
            },
            {
                "profile.appDetails.firstChoice": course_pattern,
                "isRejectedFirstChoice": {"$ne": True},
                "reconsiderationProgram": {"$in": [None, ""]},
                "reassignedProgram": {"$in": [None, ""]},
                "activeProgram": {"$in": [None, ""]}
            },
            {
                "profile.appDetails.secondChoice": course_pattern,
                "isRejectedFirstChoice": True,
                "reconsiderationProgram": {"$in": [None, ""]},
                "reassignedProgram": {"$in": [None, ""]},
                "activeProgram": {"$in": [None, ""]}
            },
            {
                "course": course_pattern,
                "firstChoice": {"$in": [None, ""]},
                "profile.appDetails.firstChoice": {"$in": [None, ""]}
            }
        ]
    }


def _build_school_year_condition(school_year):
    if not school_year:
        return None
    sy_clean = str(school_year).strip()
    sy_base = sy_clean.split()[0] if sy_clean else ""
    conditions = [
        {"schoolYear": sy_clean},
        {"schoolYear": {"$regex": f"^{re.escape(sy_base)}", "$options": "i"}}
    ]
    if sy_clean.isdigit():
        conditions.append({"schoolYear": int(sy_clean)})
    return {"$or": conditions}


def get_program_seated_count(applicant_collection, school_year, program_name_or_obj):
    if not program_name_or_obj:
        return 0

    pattern = _build_course_pattern(program_name_or_obj)
    if not pattern:
        return 0

    and_conditions = [
        _build_course_match_query(pattern),
        {
            "$or": [
                {"slotStatus": {"$in": ["Admitted", "admitted"]}},
                {"admissionStatus": {"$in": ["Admitted", "admitted"]}}
            ]
        },
        {
            "slotStatus": {"$nin": ["Forfeited", "forfeited", "Forfeit", "forfeit"]},
            "admissionStatus": {"$nin": ["Forfeited", "forfeited", "Forfeit", "forfeit"]}
        }
    ]

    sy_cond = _build_school_year_condition(school_year)
    if sy_cond:
        and_conditions.append(sy_cond)

    return applicant_collection.count_documents({"$and": and_conditions})


def get_program_applicants_count(applicant_collection, school_year, program_name_or_obj):
    if not program_name_or_obj:
        return 0

    pattern = _build_course_pattern(program_name_or_obj)
    if not pattern:
        return 0

    and_conditions = [
        _build_course_match_query(pattern),
        {
            "slotStatus": {"$nin": ["Forfeited", "forfeited", "Forfeit", "forfeit"]},
            "admissionStatus": {"$nin": ["Forfeited", "forfeited", "Forfeit", "forfeit"]}
        }
    ]

    sy_cond = _build_school_year_condition(school_year)
    if sy_cond:
        and_conditions.append(sy_cond)

    return applicant_collection.count_documents({"$and": and_conditions})


def with_capacity_status(course, applicant_collection, school_year):
    enriched = dict(course)
    if "_id" in enriched:
        enriched["_id"] = str(enriched["_id"])
    limit = _to_int(enriched.get("limit"), 0)
    applicationLimit = _to_int(enriched.get("applicationLimit"), 0)
    seated = get_program_seated_count(applicant_collection, school_year, course)
    applicants = get_program_applicants_count(applicant_collection, school_year, course)

    enriched["limit"] = limit
    enriched["applicationLimit"] = applicationLimit
    enriched["seated"] = seated
    enriched["applicants"] = applicants
    enriched["isFull"] = limit > 0 and seated >= limit
    enriched["isApplicationLimitReached"] = applicationLimit > 0 and applicants >= applicationLimit
    return enriched


def find_course_by_name(courses, program_name):
    if not program_name or not courses:
        return None

    program_name_lower = program_name.strip().lower()
    for course in courses:
        if not isinstance(course, dict):
            continue
        c_name = str(course.get("name", "")).strip().lower()
        c_abbr = str(course.get("abbreviation", "") or course.get("code", "")).strip().lower()
        if c_name == program_name_lower or c_abbr == program_name_lower:
            return course
        if " - " in program_name_lower:
            parts = [p.strip() for p in program_name_lower.split(" - ") if p.strip()]
            if c_name in parts or c_abbr in parts:
                return course
        if " - " in c_name:
            parts = [p.strip() for p in c_name.split(" - ") if p.strip()]
            if program_name_lower in parts:
                return course
    return None
