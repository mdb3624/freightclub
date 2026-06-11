import os
from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileReadTool

# ---------------------------------------------------------
# EXPLICIT PROVIDER ALLOCATION FROM ACTIVE ACCOUNT CATALOG
# Using verified models matching your explicit endpoint list.
# ---------------------------------------------------------

# Primary analytical agent model channel (Dynamic fallback to 2.5 Pro)
env_model = os.environ.get("MODEL", "gemini-2.5-pro").replace("gemini/", "")

# Temporary resilient fallback configuration
gemini_pro = LLM(
    model="gemini-2.0-flash", # Swap out 2.5 temporarily if 503s persist
    provider="google",
    temperature=0.1
)

gemini_flash = LLM(
    model="gemini-2.0-flash",
    provider="google",
    temperature=0.1
)

# Gemini Flash 2.0: Maintained for fast baseline compliance reviews
gemini_flash_visual = LLM(
    model="gemini-2.0-flash",
    provider="google",
    temperature=0.1
)


@CrewBase
class FreightClubOrchestrationCrew():
    """FreightClub Governed Sequential Pipeline with Specialized Model Allocation"""
    
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def style_guide_reader_tool(self) -> FileReadTool:
        """Enables agents to read style guides and sheets on demand instead of packing system prompts."""
        return FileReadTool()

    # ---------------------------------------------------------
    # AGENT STRUCTURAL MAPPING
    # ---------------------------------------------------------
    @agent
    def business_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['business_analyst'],
            llm=gemini_flash,
            allow_delegation=False,
            verbose=True
        )

    @agent
    def architect(self) -> Agent:
        return Agent(
            config=self.agents_config['architect'],
            llm=gemini_pro,
            allow_delegation=False,
            verbose=True
        )

    @agent
    def human_factors_designer(self) -> Agent:
        return Agent(
            config=self.agents_config['human_factors_designer'],
            llm=gemini_pro,
            tools=[self.style_guide_reader_tool()],
            allow_delegation=False,
            verbose=True
        )

    @agent
    def coder(self) -> Agent:
        return Agent(
            config=self.agents_config['coder'],
            llm=gemini_pro,
            tools=[self.style_guide_reader_tool()],
            allow_delegation=False,
            verbose=True
        )

    @agent
    def reviewer(self) -> Agent:
        return Agent(
            config=self.agents_config['reviewer'],
            llm=gemini_flash_visual,
            allow_delegation=False,
            verbose=True
        )

    @agent
    def librarian(self) -> Agent:
        return Agent(
            config=self.agents_config['librarian'],
            llm=gemini_flash,
            allow_delegation=False,
            verbose=True
        )

    # ---------------------------------------------------------
    # TASK WRAPPING
    # ---------------------------------------------------------
    @task
    def business_analysis_task(self) -> Task:
        return Task(config=self.tasks_config['business_analysis_task'], agent=self.business_analyst())

    @task
    def architectural_validation_task(self) -> Task:
        return Task(config=self.tasks_config['architectural_validation_task'], agent=self.architect())

    @task
    def hfd_ui_spec_task(self) -> Task:
        return Task(config=self.tasks_config['hfd_ui_spec_task'], agent=self.human_factors_designer())

    @task
    def code_implementation_task(self) -> Task:
        return Task(config=self.tasks_config['code_implementation_task'], agent=self.coder())

    @task
    def review_verification_task(self) -> Task:
        return Task(config=self.tasks_config['review_verification_task'], agent=self.reviewer())

    @task
    def librarian_merge_task(self) -> Task:
        return Task(config=self.tasks_config['librarian_merge_task'], agent=self.librarian())

    # ---------------------------------------------------------
    # RUNTIME ORCHESTRATION ENGINE
    # ---------------------------------------------------------
    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,   # Enforces strict Gate transitions
            memory=False,                  # Activates the self-correcting memory layer
            verbose=True,
            # Add a delay (in seconds) between task executions to respect Free Tier RPM limits
            step_delay=12
        )