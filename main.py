from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, FileResponse
from pathlib import Path
import os
from dotenv import load_dotenv
from groq import Groq
from pypdf import PdfReader
import json
from pydantic import BaseModel

load_dotenv()
client =Groq(
    api_key = os.getenv("GROQ_API_KEY")
    )
MODEL ="openai/gpt-oss-120b"

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Experience(BaseModel):
    company_name : str|None =None
    role : str |None=None
    duration:str|None =None
    Description: str |None=None
    Skills_used : list[str]=[]

class Project(BaseModel):
    name : str|None=None
    description: str|None=None
    skills_used : list[str]=[]
    live_url: str|None=None
    repository_url: str|None=None

class Resume(BaseModel):
    name : str|None=None
    email :str|None=None
    phone :str|None=None

    total_experience:str|None=None
    experience: list[Experience]=[]
    skills:list[str]=[]
    education :list[str]=[]
    projects :list[Project]=[]
    certificates:list[str]=[]
resume_schema = Resume.model_json_schema()

class ChatRequest(BaseModel):
    question: str
    stream: bool = True

def get_candidate_system_prompt(resume: Resume) -> str:
    return f"""
    You are an AI Assistant representing a job candidate (Avish Jhalani) during a virtual interview.
    Below is everything you know about the candidate:
    {resume.model_dump_json(indent=2)}

    CANDIDATE SOCIAL & PROFESSIONAL LINKS:
    - Portfolio Website: https://avishportfolio00.netlify.app/
    - GitHub: https://github.com/avishjhalani
    - LinkedIn: https://linkedin.com/in/avishjhalani
    - LeetCode: https://leetcode.com/avishjhalani

    FEATURED PROJECTS & LIVE DEMO URLS:
    1. PowerPilot AI (Flagship Project):
       - Live Application: https://powerpilot-ai-y758.onrender.com/
       - GitHub Repository: https://github.com/avishjhalani/PowerPilot-AI
       - Summary: Autonomous agentic pipeline that ingests raw CSV/Parquet, cleans, models, and compiles Power BI dashboards end-to-end.
       - Key Achievements: Processes 500,000+ records in 8.6s at <35MB peak RAM using zero-copy DuckDB profiling and out-of-core Polars streaming. Built an LLM-driven semantic modeling agent (Groq gpt-oss-120b) that synthesizes 6-8 production DAX measures from natural language within a strict 4,000-character context budget. Designed a sandboxed, self-healing execution layer using AST-based static analysis to block unsafe calls, with a 3-attempt autonomous error-recovery loop (zero unsafe executions).
       - Tech Stack: Python, FastAPI, DuckDB, Polars, Groq LLM, Docker

    2. Collab-Docs:
       - Live Application: https://collabdocs-ten.vercel.app/
       - GitHub Repository: https://github.com/avishjhalani/Collab-Docs
       - Summary: Real-time collaborative document workspace using Yjs CRDTs and WebSockets across Vercel, Render, and Supabase.
       - Key Achievements: 327ms average round-trip sync latency, 98% reduced PostgreSQL write overhead via 5-second debounced state-save buffer, 90%+ network payload reduction with compressed binary Yjs deltas (30-60 bytes/frame) over Redis Pub/Sub.
       - Tech Stack: React, NestJS, Yjs, Socket.io, PostgreSQL, Redis, Prisma, Docker

    3. BloodLink:
       - Live Application: https://bloodlink1.vercel.app/
       - GitHub Repository: https://github.com/avishjhalani/BloodLink
       - Summary: Full-stack donor-matching platform geolocating donors within 10km radius using PostGIS spatial queries (ST_DWithin, ST_Distance).
       - Key Achievements: Verified reliability with 11-case E2E test suite (Jest/Supertest) on seeded PostgreSQL. JWT in httpOnly sameSite cookies.
       - Tech Stack: Next.js, NestJS, PostgreSQL, Redis, Prisma, JWT, Nodemailer

    RULES & FORMATTING RULES:
    1. Answer accurately using the candidate's background. Always share live links and GitHub repositories when asked about projects.
    2. Keep answers highly professional, confident, and polite, as if speaking to an interviewer or recruiter.
    3. Structure your response clearly using Markdown formatting:
       - Use bold text (**keyword**) to emphasize skills, project names, and achievements.
       - Use clean bullet points (using -) for lists of experiences, tasks, or technologies.
       - When presenting tabular details (like comparing projects or listing technologies), format them in a markdown table.
       - Avoid returning long walls of plain text. Use spacing and paragraphs for readability.
    """

def ask_candidate(question :str , resume :Resume):
    system_prompt = get_candidate_system_prompt(resume)
    response = client.chat.completions.create(
        model =MODEL,
        messages=[
            {
                "role":"system",
                "content":system_prompt
            },
            {
                "role":"user",
                "content":question
            }
        ]
    )
    return response.choices[0].message.content

def ask_candidate_stream(question: str, resume: Resume):
    system_prompt = get_candidate_system_prompt(resume)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": question
            }
        ],
        stream=True
    )
    for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
def parse_resume(resume_text):
    system_prompt=f"""
    You are a expert resume parser.
    Extract information from the resume based on its meaning ,
    not only based on exact section headings.
    Diffrent resumes may use diffrennt headlings.

    for Example :
    - Experince 
    - professional experience
    - work history
    - Employment
    - Internships

    These may all contain the relevant experience.

    Skills may also appear in the skills section , work experience, internship or project.

    Return only the valid JSON matching this schema:
    {resume_schema}

    IMPORTANT INOFORMATION:
    1. Do NOT invent information.
    2. if a list has no information return empty list.
    3. if a value has no information return null.
    4. Include Internship inside the experience.
    5. Extract skills mentioned across the resume.

    """
    user_prompt=f"""
    Parse the following resume:
    {resume_text}
    """

    message_system={
        "role":"system",
        "content":system_prompt
    }
    message_user={
        "role":"user",
        "content":user_prompt
    }
    messages=[message_system,message_user]
    response_format={
        "type":"json_object"
    }
    response =client.chat.completions.create(model =MODEL,messages=messages,response_format=response_format)
    raw_output = response.choices[0].message.content
    data = json.loads(raw_output)
    resume =Resume(**data)
    return resume


def read_pdf(file_path:Path):
    reader =PdfReader(file_path)

    text =""
    for page in reader.pages:
        page_text = page.extract_text()
        text+=page_text+"\n"

    return text

candidate_resume: Resume | None = None


@app.on_event("startup")
def load_resume():

    global candidate_resume

    pdf_path = Path("Avish_Jhalani.pdf")

    resume_text = read_pdf(pdf_path)

    candidate_resume = parse_resume(resume_text)

    print("Resume loaded successfully!")

    # print(
    #     candidate_resume.model_dump_json(indent=2)
    # )


# @app.get("/")
# def home():
#     # resume_text= read_pdf(Path("Avish_Jhalani.pdf"))
#     # resume = parse_resume(resume_text)
#     # print (resume.model_dump_json(indent=2))
#     return {
#     "message":" AI working and resume parsed !!"
#     }


@app.post("/chat")
def chat(request: ChatRequest):

    if candidate_resume is None:
        return {
            "error": "Resume has not been loaded"
        }

    if request.stream:
        return StreamingResponse(
            ask_candidate_stream(request.question, candidate_resume),
            media_type="text/plain"
        )
    else:
        answer = ask_candidate(
            request.question,
            candidate_resume
        )
        return {
            "answer": answer
        }

from fastapi.responses import FileResponse

@app.get("/")
def read_index():
    return FileResponse("index.html")

@app.get("/style.css")
def read_style():
    return FileResponse("style.css")

@app.get("/script.js")
def read_script():
    return FileResponse("script.js")