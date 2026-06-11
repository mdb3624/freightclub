#!/usr/bin/env python
import sys
import os
from dotenv import load_dotenv
from freight_club_orchestration.crew import FreightClubOrchestrationCrew

# ---------------------------------------------------------
# FORCE WINDOWS TERMINAL UTF-8 STREAM ENCODING
# Prevents emoji character map crashes (\U0001f916)
# ---------------------------------------------------------
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def run():
    """
    Kick off the automated FreightClub engineering pipeline.
    Injects real-time ledger states into the core execution context window.
    """
    # ---------------------------------------------------------
    # EXPLICIT PARENT DIRECTORY PATHING
    # ---------------------------------------------------------
    # Since you are executing from: C:\projects\freightclub\freight_club_orchestration
    # Your .env and learnings.md are exactly one directory straight up (..)
    parent_dir = os.path.abspath(os.path.join(os.getcwd(), '..'))
    
    env_path = os.path.join(parent_dir, '.env')
    learnings_path = os.path.join(parent_dir, 'learnings.md')
    
    # Load Environment Variables
    if os.path.exists(env_path):
        load_dotenv(dotenv_path=env_path)
        print(f"[Success] Loaded credentials from: {env_path}")
    else:
        # Check immediate working folder just in case
        local_env = os.path.join(os.getcwd(), '.env')
        if os.path.exists(local_env):
            load_dotenv(dotenv_path=local_env)
            print(f"[Success] Loaded credentials from local fallback: {local_env}")
        else:
            load_dotenv()
            print("[Notice] Using systemic fallback context window for environment variables.")

    # Load Learnings Ledger
    current_learnings = ""
    if os.path.exists(learnings_path):
        with open(learnings_path, "r", encoding="utf-8") as f:
            current_learnings = f.read()
        print(f"[Success] Learning ledger injected cleanly from: {learnings_path}")
    else:
        print(f"[Warning] Learning ledger file not detected at path: {learnings_path}")
        print("Continuing with default execution baseline.")

    # Dynamically inject your runtime variables
    inputs = {
        'backlog_item': 'Implement Dual-Track Migration: Carrier Mobile UI (#121212) and Shipper Desktop UI (#EFEBE0) Fleet Overhaul.',
        'historical_debt_context': current_learnings if current_learnings else "No historical debt recorded."
    }
    
    print("Initializing FreightClub Orchestration Crew with Learning Feedback Injected...")
    FreightClubOrchestrationCrew().crew().kickoff(inputs=inputs)

if __name__ == "__main__":
    run()