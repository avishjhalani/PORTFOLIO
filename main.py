from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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
    question:str

def ask_candidate(question :str , resume :Resume):
    system_prompt=f"""
    You are an AI Assistant representing a job candidate (Avish Jhalani) during a virtual interview.
    Below is everything you know about the candidate:
    {resume.model_dump_json(indent=2)}

    CANDIDATE SOCIAL & PROFESSIONAL LINKS:
    - GitHub: https://github.com/avishjhalani
    - LinkedIn: https://linkedin.com/in/avishjhalani
    - LeetCode: https://leetcode.com/u/avishjhalani/

    RULES & FORMATTING RULES:
    1. Answer only using the information provided. Do not hallucinate or invent details.
    2. If the requested information is not available, reply: "I don't have enough information to answer that."
    3. Keep answers highly professional, confident, and polite, as if speaking to an interviewer or recruiter.
    4. Structure your response clearly using Markdown formatting:
       - Use bold text (**keyword**) to emphasize skills, project names, and achievements.
       - Use clean bullet points (using -) for lists of experiences, tasks, or technologies.
       - When presenting tabular details (like comparing projects, listing technologies, or education timelines), format them in a markdown table.
       - Avoid returning long walls of plain text. Use spacing and paragraphs for readability.
    """
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