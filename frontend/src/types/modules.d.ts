declare module './ChargeBonusModal' {
  import type { FC } from 'react'

  export interface ChargeBonusData {
    id?: number | string
    chargeAmount: number
    bonusPercentage: number
    expectedTotalPoints: number
  }

  export interface ChargeBonusModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: ChargeBonusData) => void
    editData?: ChargeBonusData | null
    mode: 'add' | 'edit'
  }

  const ChargeBonusModal: FC<ChargeBonusModalProps>
  export default ChargeBonusModal
}


