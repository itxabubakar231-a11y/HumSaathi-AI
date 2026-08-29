from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.user import Attempt, Badge

BADGE_DEFINITIONS = [
    {
        'code': 'first_adventure',
        'icon': '🌱',
        'titleKey': 'badge.first_adventure.title',
        'descKey': 'badge.first_adventure.desc',
    },
    {
        'code': 'star_gatherer',
        'icon': '⭐',
        'titleKey': 'badge.star_gatherer.title',
        'descKey': 'badge.star_gatherer.desc',
    },
    {
        'code': 'super_star',
        'icon': '🌟',
        'titleKey': 'badge.super_star.title',
        'descKey': 'badge.super_star.desc',
    },
    {
        'code': 'letters_explorer',
        'icon': '🔤',
        'titleKey': 'badge.letters_explorer.title',
        'descKey': 'badge.letters_explorer.desc',
    },
    {
        'code': 'numbers_explorer',
        'icon': '🔢',
        'titleKey': 'badge.numbers_explorer.title',
        'descKey': 'badge.numbers_explorer.desc',
    },
    {
        'code': 'shapes_explorer',
        'icon': '🎨',
        'titleKey': 'badge.shapes_explorer.title',
        'descKey': 'badge.shapes_explorer.desc',
    },
    {
        'code': 'counting_explorer',
        'icon': '🍎',
        'titleKey': 'badge.counting_explorer.title',
        'descKey': 'badge.counting_explorer.desc',
    },
    {
        'code': 'animals_explorer',
        'icon': '🐾',
        'titleKey': 'badge.animals_explorer.title',
        'descKey': 'badge.animals_explorer.desc',
    },
    {
        'code': 'emotions_explorer',
        'icon': '💛',
        'titleKey': 'badge.emotions_explorer.title',
        'descKey': 'badge.emotions_explorer.desc',
    },
    {
        'code': 'routines_explorer',
        'icon': '⏰',
        'titleKey': 'badge.routines_explorer.title',
        'descKey': 'badge.routines_explorer.desc',
    },
    {
        'code': 'all_rounder',
        'icon': '🌈',
        'titleKey': 'badge.all_rounder.title',
        'descKey': 'badge.all_rounder.desc',
    },
]

def calculate_stars(score: float, completed: bool = True) -> int:
    if not completed:
        return 0
    if score >= 0.9:
        return 3
    if score >= 0.5:
        return 2
    return 1

def evaluate_badges(db: Session, user_id: str) -> Dict[str, Any]:
    attempts = db.query(Attempt).filter(Attempt.userId == user_id, Attempt.completed == True).all()
    existing_badges = db.query(Badge).filter(Badge.userId == user_id).all()
    existing_codes = {b.code for b in existing_badges}

    total_completed = len(attempts)
    total_stars = sum(a.starsAwarded or 0 for a in attempts)
    topics_completed = {a.activity.topic for a in attempts if a.activity and a.activity.topic}

    eligible_codes = []
    if total_completed >= 1:
        eligible_codes.append('first_adventure')
    if total_stars >= 5:
        eligible_codes.append('star_gatherer')
    if total_stars >= 15:
        eligible_codes.append('super_star')
    if 'letters' in topics_completed:
        eligible_codes.append('letters_explorer')
    if 'numbers' in topics_completed:
        eligible_codes.append('numbers_explorer')
    if 'colors' in topics_completed or 'shapes' in topics_completed:
        eligible_codes.append('shapes_explorer')
    if 'counting' in topics_completed:
        eligible_codes.append('counting_explorer')
    if 'animals' in topics_completed:
        eligible_codes.append('animals_explorer')
    if 'emotions' in topics_completed:
        eligible_codes.append('emotions_explorer')
    if 'routines' in topics_completed:
        eligible_codes.append('routines_explorer')
    if len(topics_completed) >= 4:
        eligible_codes.append('all_rounder')

    newly_unlocked = []
    for code in eligible_codes:
        if code not in existing_codes:
            try:
                badge = Badge(userId=user_id, code=code, unlockedAt=datetime.utcnow())
                db.add(badge)
                db.commit()
                db.refresh(badge)

                def_item = next((b for b in BADGE_DEFINITIONS if b['code'] == code), None)
                if def_item:
                    newly_unlocked.append({
                        'id': badge.id,
                        'code': def_item['code'],
                        'icon': def_item['icon'],
                        'titleKey': def_item['titleKey'],
                        'descKey': def_item['descKey'],
                        'unlockedAt': badge.unlockedAt.isoformat() if badge.unlockedAt else None,
                    })
            except Exception:
                db.rollback()

    return {
        'totalStars': total_stars,
        'newlyUnlockedBadges': newly_unlocked,
    }

def get_user_rewards(db: Session, user_id: str) -> Dict[str, Any]:
    attempts = db.query(Attempt).filter(Attempt.userId == user_id, Attempt.completed == True).all()
    total_stars = sum(a.starsAwarded or 0 for a in attempts)

    earned_badges = db.query(Badge).filter(Badge.userId == user_id).order_by(Badge.unlockedAt.asc()).all()
    earned_map = {b.code: b.unlockedAt.isoformat() if b.unlockedAt else None for b in earned_badges}

    all_badges = [
        {
            'code': def_item['code'],
            'icon': def_item['icon'],
            'titleKey': def_item['titleKey'],
            'descKey': def_item['descKey'],
            'isUnlocked': def_item['code'] in earned_map,
            'unlockedAt': earned_map.get(def_item['code']),
        }
        for def_item in BADGE_DEFINITIONS
    ]

    # Find next milestone
    next_milestone = None
    if total_stars < 5:
        next_milestone = {
            'current': total_stars,
            'target': 5,
            'labelKey': 'badge.star_gatherer.title',
            'icon': '⭐',
        }
    elif total_stars < 15:
        next_milestone = {
            'current': total_stars,
            'target': 15,
            'labelKey': 'badge.super_star.title',
            'icon': '🌟',
        }
    else:
        remaining = [b for b in all_badges if not b['isUnlocked']]
        if remaining:
            next_milestone = {
                'current': len(all_badges) - len(remaining),
                'target': len(all_badges),
                'labelKey': remaining[0]['titleKey'],
                'icon': remaining[0]['icon'],
            }

    return {
        'totalStars': total_stars,
        'earnedCount': len(earned_badges),
        'totalBadgesCount': len(BADGE_DEFINITIONS),
        'badges': all_badges,
        'nextMilestone': next_milestone,
    }
