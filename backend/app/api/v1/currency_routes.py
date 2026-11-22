"""Phase 10: Currency exchange rates endpoint."""
from fastapi import APIRouter

router = APIRouter(prefix="/currency", tags=["Currency"])

# Static rates relative to USD — replace with live FX API in production
EXCHANGE_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 149.5,
    "AED": 3.67,
    "INR": 83.5,
}

CURRENCY_SYMBOLS = {
    "USD": "$",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "AED": "AED ",
    "INR": "₹",
}


@router.get("/rates", summary="Get current exchange rates relative to USD")
def get_exchange_rates():
    return {
        "base": "USD",
        "rates": EXCHANGE_RATES,
        "symbols": CURRENCY_SYMBOLS,
    }


@router.get("/convert", summary="Convert an amount from USD to a target currency")
def convert_currency(amount: float, target: str = "USD"):
    target = target.upper()
    rate = EXCHANGE_RATES.get(target)
    if rate is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Unsupported currency: {target}")
    converted = amount * rate
    symbol = CURRENCY_SYMBOLS.get(target, target + " ")
    return {
        "original_usd": amount,
        "target_currency": target,
        "rate": rate,
        "converted": round(converted, 2),
        "formatted": f"{symbol}{converted:.2f}" if target != "JPY" else f"{symbol}{int(round(converted))}",
    }

