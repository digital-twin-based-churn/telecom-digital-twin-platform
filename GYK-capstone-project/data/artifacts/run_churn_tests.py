import requests
import json
import os
from datetime import datetime
import time

ML_SERVICE_URL = "http://localhost:8000/score"
HEALTH_CHECK_URL = "http://localhost:8000/health"
TEST_SCENARIOS_FILE = "churn_test_scenarios.json"

def check_ml_service_health():
    try:
        response = requests.get(HEALTH_CHECK_URL, timeout=5)
        response.raise_for_status()
        return response.json().get("status") == "healthy"
    except requests.exceptions.RequestException:
        return False

def run_test_scenario(scenario_name: str, test_data: dict, expected_result: str, threshold: float, service_type: str):
    print(f"\n🧪 Testing {scenario_name}...")
    try:
        response = requests.post(ML_SERVICE_URL, json=test_data, timeout=10)
        response.raise_for_status()
        result = response.json()
        
        probability = result.get("churn_probability")
        prediction = "CHURN" if result.get("churn_prediction") else "NO_CHURN"
        model_used = result.get("model_used")
        threshold_used = result.get("threshold_used")

        is_correct = (prediction == expected_result)
        
        print(f"   Probability: {probability:.1%}")
        print(f"   Threshold: {threshold_used:.1%}")
        print(f"   Prediction: {prediction}")
        print(f"   Expected: {expected_result}")
        print(f"   Result: {'✅ DOĞRU' if is_correct else '❌ YANLIŞ'}")
        
        return {
            "probability": probability,
            "threshold": threshold_used,
            "prediction": prediction,
            "correct": is_correct,
            "timestamp": datetime.utcnow().isoformat(timespec='seconds') + 'Z',
            "model_used": model_used
        }
    except requests.exceptions.RequestException as e:
        print(f"   Hata: {e}")
        return {
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(timespec='seconds') + 'Z'
        }

def main():
    print("\n🧪 CHURN TEST SCENARIOS ÇALIŞTIRIYORUM...")
    print("="*40)

    if not check_ml_service_health():
        print("❌ ML Service çalışmıyor. Lütfen önce servisi başlatın.")
        return

    print("✅ ML Service çalışıyor")

    with open(TEST_SCENARIOS_FILE, 'r', encoding='utf-8') as f:
        test_data = json.load(f)

    total_scenarios = 0
    correct_predictions = 0
    
    for service_type, scenarios in test_data["test_scenarios"].items():
        print(f"\n📊 {service_type} Tests:")
        for scenario_key, scenario_details in scenarios.items():
            total_scenarios += 1
            
            actual_result = run_test_scenario(
                scenario_details["scenario_name"],
                scenario_details["test_data"],
                scenario_details["expected_result"],
                test_data["test_summary"].get("thresholds_used", {}).get(service_type, 0.0), # Fallback threshold
                service_type
            )
            
            scenario_details["actual_result"] = actual_result
            if actual_result.get("correct"):
                correct_predictions += 1

    accuracy = (correct_predictions / total_scenarios) if total_scenarios > 0 else 0.0
    
    test_data["test_summary"] = {
        "total_scenarios": total_scenarios,
        "correct_predictions": correct_predictions,
        "incorrect_predictions": total_scenarios - correct_predictions,
        "accuracy": accuracy,
        "test_date": datetime.now().strftime("%Y-%m-%d"),
        "test_time": datetime.now().strftime("%H:%M:%S")
    }
    test_data["test_date"] = datetime.now().strftime("%Y-%m-%d")
    test_data["test_environment"] = "Production ML Service"

    with open(TEST_SCENARIOS_FILE, 'w', encoding='utf-8') as f:
        json.dump(test_data, f, ensure_ascii=False, indent=2)

    print("\n📊 TEST SONUÇLARI ÖZETİ")
    print("="*30)
    print(f"Toplam Test: {total_scenarios}")
    print(f"Doğru Tahmin: {correct_predictions}")
    print(f"Yanlış Tahmin: {total_scenarios - correct_predictions}")
    print(f"Başarı Oranı: {accuracy:.1%}")
    print(f"\n💾 Sonuçlar {TEST_SCENARIOS_FILE} dosyasına kaydedildi")

if __name__ == "__main__":
    main()
