import importlib.util
import unittest
from pathlib import Path
spec = importlib.util.spec_from_file_location("bridge", Path(__file__).resolve().parents[1]/"arduino_bridge.py")
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)
class BridgeTests(unittest.TestCase):
    def test_valid_reading(self):
        data = bridge.parse_reading("DATA,55.43,1,10.474962,-85.060623")
        self.assertEqual(data["distance"], 55.43)
        self.assertTrue(data["obstacleDetected"])
    def test_rejects_invalid_and_nonfinite_readings(self):
        for line in ("DATA,nan,0,0,0", "DATA,1,0,91,0", "DATA,-1,0,0,0", "DATA,1,2,0,0", "DATA,inf,0,0,0", "DATA,1,0,0"):
            with self.subTest(line=line), self.assertRaises(ValueError):
                bridge.parse_reading(line)
if __name__ == "__main__":
    unittest.main()
