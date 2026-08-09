"""Import all models here so that Alembic can discover them via autogenerate."""
from app.db.base_class import Base  # noqa: F401
from app.models.user import User, UserProfile  # noqa: F401
from app.models.vehicle import VehicleMaster  # noqa: F401
from app.models.subsidy import SubsidyRule, SubsidyApplication  # noqa: F401
from app.models.dealer import Dealer, DealerLead, Appointment  # noqa: F401
from app.models.recommendation import Recommendation  # noqa: F401
from app.models.certification import BatteryReport  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.conversation import AiConversation  # noqa: F401
from app.models.news import NewsArticle  # noqa: F401
from app.models.charging import (  # noqa: F401
    ChargingStation,
    Connector,
    StationReview,
    ReliabilityScore,
    CrowdsourcedCheckin,
)

