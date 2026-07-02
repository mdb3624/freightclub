export type LoadStatus = 'DRAFT' | 'OPEN' | 'CLAIMED' | 'IN_TRANSIT' | 'DELIVERED' | 'SETTLED' | 'CANCELLED'

export interface StatusBadgeProps {
  /** Load lifecycle status from the FreightClub API */
  status: LoadStatus
}

export declare function StatusBadge(props: StatusBadgeProps): JSX.Element
