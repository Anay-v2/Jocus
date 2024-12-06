import type { UNOCard } from "@/utils/types"
import { Card } from "uno-engine"

export function cardconv(card: Card): UNOCard {
    const val = card.value
    const col = card.color
    if(val === 13 || val === 14) return {
        type: 'u',
        card: 'w' + (val === 13 ? 'c' : '4') as 'wc' | 'w4'
    }
    return {
        type: 'u',
        card: ['', 'r', 'g', 'b', 'y'][col] + (val < 10 ? val : ['', 'p', 'f', 's'][val - 10]) as 'g0'
    }
}