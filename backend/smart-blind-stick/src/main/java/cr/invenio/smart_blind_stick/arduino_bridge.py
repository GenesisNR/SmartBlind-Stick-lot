from pathlib import Path
import runpy
if __name__ == "__main__":
    project = Path(__file__).resolve().parents[6]
    runpy.run_path(str(project / "arduino_bridge.py"), run_name="__main__")
