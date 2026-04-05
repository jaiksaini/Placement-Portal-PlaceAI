from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from collections import defaultdict

app = Flask(__name__)
CORS(app)

SKILL_ALIASES = {
    "js": "javascript", "ts": "typescript", "nodejs": "node.js",
    "node": "node.js", "reactjs": "react", "react.js": "react",
    "vuejs": "vue.js", "vue": "vue.js", "angularjs": "angular",
    "postgresql": "postgres", "mysql": "sql", "mongodb": "mongo",
    "ml": "machine learning", "ai": "artificial intelligence",
    "dl": "deep learning", "nlp": "natural language processing",
    "k8s": "kubernetes", "aws": "amazon web services",
    "springboot": "spring boot", "spring": "spring boot",
    "tf": "tensorflow", "sklearn": "scikit-learn",
}

SKILL_CATEGORIES = {
    "frontend": ["react", "vue.js", "angular", "javascript", "typescript", "html", "css", "next.js"],
    "backend": ["node.js", "express", "django", "flask", "spring boot", "java", "python", "go", "php"],
    "database": ["mongodb", "sql", "postgres", "mysql", "redis", "firebase", "dynamodb"],
    "devops": ["docker", "kubernetes", "aws", "azure", "gcp", "linux", "terraform"],
    "ml": ["machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy"],
    "mobile": ["react native", "flutter", "swift", "kotlin", "android", "ios"],
}


def normalize_skill(skill):
    s = skill.lower().strip()
    s = re.sub(r'[^a-z0-9.#+\s]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return SKILL_ALIASES.get(s, s)


def get_skill_category(skill):
    normalized = normalize_skill(skill)
    for cat, skills in SKILL_CATEGORIES.items():
        if normalized in skills:
            return cat
    return None


def compute_match_score(student_skills, job_skills):
    if not job_skills:
        return {"match_score": 0, "matched_skills": [], "missing_skills": [], "category_matches": {}}

    normalized_student = [normalize_skill(s) for s in student_skills]
    normalized_job = [normalize_skill(s) for s in job_skills]

    matched_skills = []
    missing_skills = []
    total_score = 0.0
    category_matches = defaultdict(list)

    for i, job_skill in enumerate(normalized_job):
        original_job_skill = job_skills[i] if i < len(job_skills) else job_skill
        score_for_skill = 0.0

        if job_skill in normalized_student:
            score_for_skill = 1.0
            matched_skills.append(original_job_skill)
        else:
            partial_found = False
            for s_skill in normalized_student:
                if (job_skill in s_skill or s_skill in job_skill) and len(job_skill) > 2 and len(s_skill) > 2:
                    score_for_skill = 0.6
                    matched_skills.append(original_job_skill + " (partial)")
                    partial_found = True
                    break

            if not partial_found:
                job_cat = get_skill_category(job_skill)
                if job_cat:
                    student_cats = [get_skill_category(s) for s in normalized_student]
                    if job_cat in student_cats:
                        score_for_skill = 0.3
                        category_matches[job_cat].append(original_job_skill)

                if score_for_skill == 0.0:
                    missing_skills.append(original_job_skill)

        total_score += score_for_skill

    raw_score = (total_score / len(normalized_job)) * 100
    bonus = min(5, len(normalized_student) * 0.5)
    final_score = min(100, round(raw_score + (bonus if raw_score > 50 else 0), 1))

    return {
        "match_score": final_score,
        "matched_skills": list(set(matched_skills)),
        "missing_skills": list(set(missing_skills)),
        "category_matches": dict(category_matches),
        "total_student_skills": len(student_skills),
        "total_job_skills": len(job_skills),
    }


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "OK", "service": "AI Skill Matching Service", "version": "1.0.0"})


@app.route('/match', methods=['POST'])
def match_skills():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    student_skills = data.get('student_skills', [])
    job_skills = data.get('job_skills', [])
    if not isinstance(student_skills, list) or not isinstance(job_skills, list):
        return jsonify({"error": "Skills must be arrays"}), 400
    result = compute_match_score(student_skills, job_skills)
    return jsonify(result)


@app.route('/bulk-match', methods=['POST'])
def bulk_match():
    data = request.get_json()
    student_skills = data.get('student_skills', [])
    jobs = data.get('jobs', [])
    results = []
    for job in jobs:
        result = compute_match_score(student_skills, job.get('skills', []))
        results.append({"job_id": job.get('id'), **result})
    results.sort(key=lambda x: x['match_score'], reverse=True)
    return jsonify({"results": results})


@app.route('/analyze-skills', methods=['POST'])
def analyze_skills():
    data = request.get_json()
    skills = data.get('skills', [])
    categorized = defaultdict(list)
    uncategorized = []
    for skill in skills:
        cat = get_skill_category(skill)
        if cat:
            categorized[cat].append(skill)
        else:
            uncategorized.append(skill)
    return jsonify({"categorized": dict(categorized), "uncategorized": uncategorized, "total": len(skills)})



# ─── RESUME CHECKER ──────────────────────────────────────────────────────────

CONTACT_PATTERNS = [
    r'[\w\.-]+@[\w\.-]+\.\w+',               # email
    r'(\+?\d[\d\s\-().]{7,}\d)',              # phone
    r'linkedin\.com/in/\S+',                  # linkedin
    r'github\.com/\S+',                       # github
    r'https?://\S+',                          # website
]

SECTION_KEYWORDS = {
    'summary':    ['summary', 'objective', 'profile', 'about', 'overview', 'introduction'],
    'experience': ['experience', 'work experience', 'employment', 'professional experience', 'internship', 'intern'],
    'skills':     ['skills', 'technical skills', 'technologies', 'tools', 'expertise', 'competencies', 'stack'],
    'education':  ['education', 'academic', 'degree', 'university', 'college', 'school', 'gpa', 'coursework'],
    'projects':   ['projects', 'personal projects', 'portfolio', 'open source', 'side projects', 'built', 'developed'],
    'achievements':['achievements', 'awards', 'honors', 'certifications', 'certificates', 'recognition'],
}

WEAK_VERBS = ['responsible for', 'helped', 'assisted', 'worked on', 'was involved in', 'did', 'made', 'used']
STRONG_VERBS = ['developed', 'built', 'designed', 'implemented', 'led', 'spearheaded', 'architected',
                'optimized', 'reduced', 'increased', 'improved', 'delivered', 'launched', 'created',
                'automated', 'engineered', 'managed', 'migrated', 'integrated', 'deployed', 'analyzed']

BUZZWORDS_TO_AVOID = ['hardworking', 'team player', 'go-getter', 'detail-oriented', 'passionate',
                       'dynamic', 'results-driven', 'self-motivated', 'proactive', 'synergy']


def detect_sections(text_lower):
    found = {}
    for section, keywords in SECTION_KEYWORDS.items():
        found[section] = any(kw in text_lower for kw in keywords)
    return found


def score_contact(text, text_lower):
    score = 0
    issues = []
    suggestions = []
    found_items = []

    if re.search(CONTACT_PATTERNS[0], text):
        score += 25; found_items.append('email')
    else:
        issues.append('No email address detected')
        suggestions.append({'priority': 'critical', 'text': 'Add your professional email address (e.g., john.doe@gmail.com)'})

    if re.search(CONTACT_PATTERNS[1], text):
        score += 20; found_items.append('phone')
    else:
        issues.append('No phone number detected')
        suggestions.append({'priority': 'critical', 'text': 'Add a phone number so recruiters can contact you directly'})

    if re.search(CONTACT_PATTERNS[2], text_lower):
        score += 20; found_items.append('LinkedIn')
    else:
        issues.append('No LinkedIn profile link found')
        suggestions.append({'priority': 'important', 'text': 'Add your LinkedIn URL (linkedin.com/in/yourname) — 70% of recruiters check it'})

    if re.search(CONTACT_PATTERNS[3], text_lower) or re.search(CONTACT_PATTERNS[4], text_lower):
        score += 20; found_items.append('GitHub/Website')
    else:
        suggestions.append({'priority': 'nice', 'text': 'Add a GitHub profile or personal website to showcase your work'})

    # Name at top
    first_lines = text.strip().split('\n')[:4]
    if any(len(line.strip()) > 2 and len(line.strip()) < 60 for line in first_lines):
        score += 15

    return min(100, score), issues, suggestions


def score_summary(text, text_lower):
    sections = detect_sections(text_lower)
    score = 0
    issues = []
    suggestions = []

    if not sections['summary']:
        issues.append('No summary or objective section detected')
        suggestions.append({'priority': 'critical', 'text': 'Add a 2-3 sentence professional summary at the top highlighting your key value proposition'})
        return 0, issues, suggestions

    score += 40
    # Check length
    summary_match = re.search(r'(summary|objective|profile|about)[^\n]*\n(.*?)(?=\n[A-Z]|\Z)', text_lower, re.DOTALL | re.IGNORECASE)
    if summary_match:
        summary_text = summary_match.group(2)
        word_count = len(summary_text.split())
        if word_count < 20:
            issues.append('Summary is too short')
            suggestions.append({'priority': 'important', 'text': 'Expand your summary to 40-80 words — mention your experience, key skills, and career goal'})
        elif word_count > 120:
            issues.append('Summary is too long')
            suggestions.append({'priority': 'important', 'text': 'Shorten your summary to 40-80 words — recruiters spend <10 seconds on it'})
        else:
            score += 30

    # Check for buzzwords
    bad = [b for b in BUZZWORDS_TO_AVOID if b in text_lower]
    if bad:
        issues.append(f'Clichéd buzzwords found: {", ".join(bad[:3])}')
        suggestions.append({'priority': 'important', 'text': f'Replace generic words ({", ".join(bad[:3])}) with specific achievements or skills'})
    else:
        score += 30

    return min(100, score), issues, suggestions


def score_experience(text, text_lower):
    sections = detect_sections(text_lower)
    score = 0
    issues = []
    suggestions = []

    if not sections['experience']:
        issues.append('No work experience section detected')
        suggestions.append({'priority': 'critical', 'text': 'Add a Work Experience section. Include internships, freelance, or open-source contributions if no full-time experience'})
        return 0, issues, suggestions

    score += 30

    # Check for bullet points / action verbs
    bullet_count = len(re.findall(r'[•\-\*]\s+\w', text))
    if bullet_count < 3:
        issues.append('Very few bullet points in experience section')
        suggestions.append({'priority': 'critical', 'text': 'Use 3-5 bullet points per role starting with strong action verbs (developed, built, optimized)'})
    elif bullet_count >= 6:
        score += 20

    strong = sum(1 for v in STRONG_VERBS if v in text_lower)
    weak = sum(1 for v in WEAK_VERBS if v in text_lower)

    if strong >= 3:
        score += 25
    elif strong >= 1:
        score += 10
        suggestions.append({'priority': 'important', 'text': 'Use more strong action verbs: developed, architected, optimized, delivered instead of helped/assisted'})
    else:
        issues.append('No strong action verbs detected')
        suggestions.append({'priority': 'critical', 'text': 'Start every bullet with a power verb: Built, Designed, Implemented, Optimized, Led, Delivered'})

    if weak > 0:
        suggestions.append({'priority': 'important', 'text': f'Replace passive phrases like "responsible for" or "helped with" with direct action verbs'})

    # Quantification check
    numbers = re.findall(r'\d+[%x]?', text)
    if len(numbers) >= 3:
        score += 25
    elif len(numbers) >= 1:
        score += 10
        suggestions.append({'priority': 'important', 'text': 'Add more metrics: "Reduced load time by 40%", "Served 10k+ users", "Increased revenue by $50K"'})
    else:
        issues.append('No quantified achievements found')
        suggestions.append({'priority': 'critical', 'text': 'Quantify your impact with numbers: percentages, user counts, time saved, revenue impacted'})

    return min(100, score), issues, suggestions


def score_skills(text, text_lower):
    sections = detect_sections(text_lower)
    score = 0
    issues = []
    suggestions = []

    if not sections['skills']:
        issues.append('No skills section detected')
        suggestions.append({'priority': 'critical', 'text': 'Add a dedicated Skills section with technical tools, languages, and frameworks'})
        return 0, issues, suggestions

    score += 30

    # Count skills-like tokens (comma/newline separated terms)
    skill_tokens = re.findall(r'\b[A-Z][a-zA-Z.#+\s]{1,20}(?=,|\n|•)', text)
    tech_terms = re.findall(r'\b(?:Python|JavaScript|Java|React|Node|SQL|AWS|Docker|Kubernetes|Git|CSS|HTML|TypeScript|Go|Rust|C\+\+|MongoDB|Redis|Flask|Django|Spring|Vue|Angular|TensorFlow|PyTorch|Figma|Linux)\b', text, re.IGNORECASE)

    if len(tech_terms) >= 6:
        score += 40
    elif len(tech_terms) >= 3:
        score += 20
        suggestions.append({'priority': 'important', 'text': 'List more specific technologies — aim for 8-15 skills across categories (languages, frameworks, tools, databases)'})
    else:
        issues.append('Very few recognizable technical skills')
        suggestions.append({'priority': 'critical', 'text': 'List specific technologies, not just generic terms. Example: Python, React.js, PostgreSQL, Docker, Git'})

    # Check if skills are organized
    if re.search(r'(languages|frameworks|databases|tools|cloud)\s*:', text_lower):
        score += 30
    else:
        suggestions.append({'priority': 'nice', 'text': 'Organize skills into categories: Languages | Frameworks | Databases | Tools | Cloud'})
        score += 10

    return min(100, score), issues, suggestions


def score_education(text, text_lower):
    sections = detect_sections(text_lower)
    score = 0
    issues = []
    suggestions = []

    if not sections['education']:
        issues.append('No education section found')
        suggestions.append({'priority': 'critical', 'text': 'Add an Education section with degree, institution, major, and graduation year'})
        return 0, issues, suggestions

    score += 40

    if re.search(r'gpa\s*[:\-]?\s*\d\.\d', text_lower):
        score += 20

    year_match = re.search(r'20\d\d', text)
    if year_match:
        score += 20
    else:
        suggestions.append({'priority': 'important', 'text': 'Include graduation year (or expected graduation year) in your education section'})

    degree = re.search(r'\b(b\.?tech|b\.?e|b\.?sc|m\.?tech|m\.?sc|bachelor|master|phd|doctorate)\b', text_lower)
    if degree:
        score += 20
    else:
        suggestions.append({'priority': 'important', 'text': 'Clearly state your degree type (B.Tech, B.Sc, M.Tech, etc.)'})

    return min(100, score), issues, suggestions


def score_projects(text, text_lower):
    sections = detect_sections(text_lower)
    score = 0
    issues = []
    suggestions = []

    if not sections['projects']:
        suggestions.append({'priority': 'important', 'text': 'Add a Projects section — especially important for students. Include 2-3 personal or academic projects'})
        return 20, issues, suggestions  # partial credit since not always required

    score += 30

    tech_in_projects = re.findall(r'\b(?:Python|JavaScript|React|Node|SQL|Docker|Flask|Django|Vue|Angular|MongoDB|MySQL|Redis|AWS|Firebase|Express|Spring|Java)\b', text, re.IGNORECASE)
    if len(tech_in_projects) >= 3:
        score += 30
    else:
        suggestions.append({'priority': 'important', 'text': 'Mention the tech stack used in each project (e.g., "Built with React, Node.js, and MongoDB")'})

    links = re.findall(r'github\.com/\S+|https?://\S+', text_lower)
    if links:
        score += 25
    else:
        suggestions.append({'priority': 'important', 'text': 'Add GitHub or live demo links to each project so recruiters can see your actual work'})

    # Quantified impact in projects
    project_numbers = re.findall(r'\d+[%k+x]?', text)
    if len(project_numbers) >= 2:
        score += 15
    else:
        suggestions.append({'priority': 'nice', 'text': 'Add impact metrics to projects: "Handled 1000+ concurrent users", "Reduced latency by 30%"'})

    return min(100, score), issues, suggestions


def score_formatting(text):
    score = 0
    issues = []
    suggestions = []
    lines = text.strip().split('\n')
    word_count = len(text.split())

    # Length
    if 300 <= word_count <= 800:
        score += 30
    elif word_count < 200:
        issues.append(f'Resume is too short ({word_count} words)')
        suggestions.append({'priority': 'critical', 'text': f'Your resume is too short ({word_count} words). A strong resume is 400-700 words (1 page for students)'})
    elif word_count > 1000:
        issues.append(f'Resume is too long ({word_count} words)')
        suggestions.append({'priority': 'important', 'text': f'At {word_count} words, your resume may be too long. Trim to 1 page for < 5 years experience'})
    else:
        score += 20

    # Consistent formatting: check for all-caps section headers
    caps_lines = [l for l in lines if l.strip().isupper() and len(l.strip()) > 2]
    if caps_lines:
        score += 20

    # Bullet point usage
    bullets = len(re.findall(r'[\•\-\*]\s', text))
    if bullets >= 5:
        score += 25
    elif bullets >= 2:
        score += 10
    else:
        suggestions.append({'priority': 'important', 'text': 'Use bullet points (•) for experience and project descriptions — easier to scan'})

    # Check for inconsistent whitespace / excessive blank lines
    blank_lines = sum(1 for l in lines if l.strip() == '')
    if blank_lines > len(lines) * 0.4:
        issues.append('Excessive blank lines detected')
        suggestions.append({'priority': 'nice', 'text': 'Reduce blank lines between sections — use consistent spacing'})
    else:
        score += 25

    return min(100, score), issues, suggestions


@app.route('/analyze-resume', methods=['POST'])
def analyze_resume():
    data = request.get_json()
    if not data or not data.get('resume_text'):
        return jsonify({'error': 'resume_text is required'}), 400

    text = data['resume_text']
    text_lower = text.lower()

    if len(text.strip()) < 50:
        return jsonify({'error': 'Resume text is too short to analyze'}), 400

    # Score each section
    contact_score,    contact_issues,    contact_sugg    = score_contact(text, text_lower)
    summary_score,    summary_issues,    summary_sugg    = score_summary(text, text_lower)
    experience_score, experience_issues, experience_sugg = score_experience(text, text_lower)
    skills_score,     skills_issues,     skills_sugg     = score_skills(text, text_lower)
    education_score,  education_issues,  education_sugg  = score_education(text, text_lower)
    projects_score,   projects_issues,   projects_sugg   = score_projects(text, text_lower)
    formatting_score, formatting_issues, formatting_sugg = score_formatting(text)

    # Weighted overall score
    weights = {
        'contact':    0.10,
        'summary':    0.12,
        'experience': 0.28,
        'skills':     0.20,
        'education':  0.12,
        'projects':   0.10,
        'formatting': 0.08,
    }
    scores = {
        'contact':    contact_score,
        'summary':    summary_score,
        'experience': experience_score,
        'skills':     skills_score,
        'education':  education_score,
        'projects':   projects_score,
        'formatting': formatting_score,
    }
    overall = round(sum(scores[k] * weights[k] for k in weights), 1)

    # Compile all suggestions, sorted by priority
    all_suggestions = (
        contact_sugg + summary_sugg + experience_sugg +
        skills_sugg + education_sugg + projects_sugg + formatting_sugg
    )
    priority_order = {'critical': 0, 'important': 1, 'nice': 2}
    all_suggestions.sort(key=lambda x: priority_order.get(x['priority'], 3))

    all_issues = (
        contact_issues + summary_issues + experience_issues +
        skills_issues + education_issues + projects_issues + formatting_issues
    )

    # Grade
    if overall >= 80: grade, grade_label = 'A', 'Excellent'
    elif overall >= 65: grade, grade_label = 'B', 'Good'
    elif overall >= 50: grade, grade_label = 'C', 'Needs Work'
    elif overall >= 35: grade, grade_label = 'D', 'Poor'
    else:               grade, grade_label = 'F', 'Critical Issues'

    return jsonify({
        'overall_score': overall,
        'grade': grade,
        'grade_label': grade_label,
        'word_count': len(text.split()),
        'sections': {
            'contact':    {'score': contact_score,    'label': 'Contact Info'},
            'summary':    {'score': summary_score,    'label': 'Summary / Objective'},
            'experience': {'score': experience_score, 'label': 'Work Experience'},
            'skills':     {'score': skills_score,     'label': 'Skills'},
            'education':  {'score': education_score,  'label': 'Education'},
            'projects':   {'score': projects_score,   'label': 'Projects'},
            'formatting': {'score': formatting_score, 'label': 'Formatting'},
        },
        'issues':      all_issues,
        'suggestions': all_suggestions,
        'critical_count':   sum(1 for s in all_suggestions if s['priority'] == 'critical'),
        'important_count':  sum(1 for s in all_suggestions if s['priority'] == 'important'),
        'nice_count':       sum(1 for s in all_suggestions if s['priority'] == 'nice'),
    })

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8000))
    print(f"AI Skill Matching Service starting on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
