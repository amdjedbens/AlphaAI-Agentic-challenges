"""
Team authentication using pre-generated keys.
Each team receives a unique key that maps to their team name.
Keys are generated from team_name + salt, encoded in base64.
"""
import base64
import hashlib
from typing import Optional, Dict

# Secret salt - keep this secure!
TEAM_KEY_SALT = "alpha_ai_datathon_2025_secret_salt"

# Predefined teams from the competition
TEAMS = [
    "911",
    "wanodevs",
    "22_ai_street",
    "chachra",
    "ensia-team",
    "zero_day",
    "zero-shot-squad",
    "w-mb3d",
    "data-divas",
    "itc",
    "braincrackers",
    "th3-s4ts",
    "team7",
    "الجمعية",
    "hermanos",
    "dababis",
    "bianconeri",
]


def generate_team_key(team_name: str) -> str:
    """
    Generate a unique key for a team.
    Uses SHA256 hash of (team_name + salt), then base64 encode.
    Returns a 12-character key for easy sharing.
    """
    combined = f"{team_name}:{TEAM_KEY_SALT}"
    hash_bytes = hashlib.sha256(combined.encode()).digest()
    # Take first 9 bytes and base64 encode for a 12-char key
    key = base64.urlsafe_b64encode(hash_bytes[:9]).decode()
    return key


def generate_all_team_keys() -> Dict[str, str]:
    """Generate keys for all registered teams."""
    return {team: generate_team_key(team) for team in TEAMS}


# Pre-computed mapping of key -> team_name for fast lookups
_KEY_TO_TEAM: Dict[str, str] = {}

def _init_key_mapping():
    """Initialize the key to team mapping."""
    global _KEY_TO_TEAM
    _KEY_TO_TEAM = {generate_team_key(team): team for team in TEAMS}

# Initialize on module load
_init_key_mapping()


def validate_team_key(key: str) -> Optional[str]:
    """
    Validate a team key and return the team name if valid.
    Returns None if the key is invalid.
    """
    return _KEY_TO_TEAM.get(key)


def get_team_name_from_key(key: str) -> Optional[str]:
    """Alias for validate_team_key for clarity."""
    return validate_team_key(key)


def is_valid_team_key(key: str) -> bool:
    """Check if a key is valid."""
    return key in _KEY_TO_TEAM


def get_all_team_keys() -> Dict[str, str]:
    """Get all team keys (team_name -> key mapping). For admin use."""
    return {team: generate_team_key(team) for team in TEAMS}


def add_team(team_name: str) -> str:
    """
    Add a new team dynamically (persists only in memory).
    Returns the generated key.
    """
    if team_name not in TEAMS:
        TEAMS.append(team_name)
    key = generate_team_key(team_name)
    _KEY_TO_TEAM[key] = team_name
    return key


if __name__ == "__main__":
    # Print all team keys for distribution
    print("\n" + "="*60)
    print("ALPHA AI DATATHON - TEAM KEYS")
    print("="*60 + "\n")
    
    keys = get_all_team_keys()
    for team, key in keys.items():
        print(f"Team: {team:20} | Key: {key}")
    
    print("\n" + "="*60)
    print("Keep these keys secure! Distribute individually to each team.")
    print("="*60 + "\n")

