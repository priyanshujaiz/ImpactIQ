def build_error(stage, error, **kwargs):
    return {
        "success": False,
        "stage": stage,
        "error": str(error),
        "debug": kwargs
    }


def safe_dict(obj):
    try:
        return obj.dict()
    except:
        return str(obj)