interface Ruleset {
  // The id of the ruleset.
  name: string
  layouts: Layouts
  rules: Rules
  code: Code
  selection: Object // Remember the currently selected state, role, tab
  metadata: Metadata
}

type Layouts = Map<State, Map<Role, string>>

/**
 * A mapping of a states to a block of code to run
 */
type Code = Map<State, string> & { errors: Map<State, string> }

interface Rules {
  states: Array<State>
  roles: Array<Role>
  testers: Array<String>
}

type State = string
type Role = string

/**
 * Information about the ruleset for display/listing, but not actual gameplay
 */
interface Metadata {
  title: string
  creatorName: string
  creatorId: string
  thumbnail: string
  description: string
  tagsString: string
  minPlayers: number
  maxPlayers: number
  playTime: number // in minutes

  status: string // One of 'DRAFT', 'PUBLISHED', 'IN_REVIEW', 'REJECTED'
}
