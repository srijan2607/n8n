import type { INodeProperties } from 'n8n-workflow';

// UI definition for the in.culcate Realms node. Fields are grouped per operation
// via displayOptions so the canvas only shows relevant inputs.

export const operationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	default: 'createProjectCharter',
	options: [
		{
			name: 'Create Project Charter',
			value: 'createProjectCharter',
			description:
				'Turn a seed/brief into a Project Charter, Story Kernel, unknowns register, and gate checklist',
			action: 'Create a project charter',
		},
		{
			name: 'Build Development Plan',
			value: 'buildDevelopmentPlan',
			description:
				'Produce Realms theory, assumptions, milestone tickets, format policy pack, RolePolicy roster, and stage contracts',
			action: 'Build a development plan',
		},
		{
			name: 'Compile Realm Package',
			value: 'compileRealmPackage',
			description: 'Compile a deterministic studio package skeleton from a seed',
			action: 'Compile a realm package',
		},
		{
			name: 'Generate Artifact Pack',
			value: 'generateArtifactPack',
			description:
				'Generate a full deterministic PRD artifact pack with schemas, versions, gates, and checksums',
			action: 'Generate artifact pack',
		},
		{
			name: 'Evaluate Gate',
			value: 'evaluateGate',
			description: 'Evaluate an artifact against a human gate and recommend a disposition',
			action: 'Evaluate a gate',
		},
	],
};

const formatOptions: INodeProperties = {
	displayName: 'Format',
	name: 'format',
	type: 'options',
	default: 'feature',
	options: [
		{ name: 'Feature Film', value: 'feature' },
		{ name: 'Series', value: 'series' },
		{ name: 'Short', value: 'short' },
		{ name: 'Branded Film', value: 'branded' },
		{ name: 'Documentary', value: 'documentary' },
		{ name: 'Micro / Social', value: 'micro' },
	],
};

export const createProjectCharterFields: INodeProperties[] = [
	{
		displayName: 'Seed / Brief',
		name: 'seed',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		placeholder: 'A one-line premise or a longer brief…',
		description: 'The seed, brief, or source material that starts development',
		displayOptions: { show: { operation: ['createProjectCharter'] } },
	},
	{ ...formatOptions, displayOptions: { show: { operation: ['createProjectCharter'] } } },
	{
		displayName: 'Runtime (Minutes)',
		name: 'runtimeMinutes',
		type: 'number',
		default: 100,
		typeOptions: { minValue: 1 },
		description: 'Target runtime in minutes',
		displayOptions: { show: { operation: ['createProjectCharter'] } },
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'en',
		description: 'Primary language code or name',
		displayOptions: { show: { operation: ['createProjectCharter'] } },
	},
	{
		displayName: 'Audience',
		name: 'audience',
		type: 'string',
		default: '',
		placeholder: 'e.g. global streaming drama viewers, 25-45',
		description: 'Intended audience description',
		displayOptions: { show: { operation: ['createProjectCharter'] } },
	},
	{
		displayName: 'Route to Market',
		name: 'routeToMarket',
		type: 'options',
		default: 'streaming',
		options: [
			{ name: 'Theatrical', value: 'theatrical' },
			{ name: 'Streaming', value: 'streaming' },
			{ name: 'Broadcast', value: 'broadcast' },
			{ name: 'Social', value: 'social' },
			{ name: 'Festival', value: 'festival' },
		],
		displayOptions: { show: { operation: ['createProjectCharter'] } },
	},
	{
		displayName: 'Production Mode',
		name: 'productionMode',
		type: 'options',
		default: 'liveAction',
		options: [
			{ name: 'Live Action', value: 'liveAction' },
			{ name: 'Animation', value: 'animation' },
			{ name: 'Hybrid', value: 'hybrid' },
			{ name: 'AI-Assisted', value: 'aiAssisted' },
		],
		displayOptions: { show: { operation: ['createProjectCharter'] } },
	},
	{
		displayName: 'Constraints',
		name: 'constraints',
		type: 'string',
		typeOptions: { rows: 2 },
		default: '',
		placeholder: 'Comma or newline separated, e.g. PG-13, single location',
		description: 'Hard constraints, comma or newline separated',
		displayOptions: { show: { operation: ['createProjectCharter'] } },
	},
];

export const buildDevelopmentPlanFields: INodeProperties[] = [
	{
		displayName: 'Charter JSON or Seed',
		name: 'charterOrSeed',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		placeholder: 'Paste a Project Charter JSON, or a plain seed/brief',
		description:
			'Either a Project Charter JSON object or a plain-text seed. JSON is parsed for the seed/format.',
		displayOptions: { show: { operation: ['buildDevelopmentPlan'] } },
	},
	{
		...formatOptions,
		displayOptions: { show: { operation: ['buildDevelopmentPlan'] } },
		description:
			'Format used to build the format policy pack (ignored if a charter JSON supplies one)',
	},
	{
		displayName: 'Source Mode',
		name: 'sourceMode',
		type: 'options',
		default: 'original',
		options: [
			{ name: 'Original', value: 'original' },
			{ name: 'Adaptation', value: 'adaptation' },
			{ name: 'IP Extension', value: 'ipExtension' },
			{ name: 'Brand Brief', value: 'brandBrief' },
		],
		displayOptions: { show: { operation: ['buildDevelopmentPlan'] } },
	},
	{
		displayName: 'Research Depth',
		name: 'researchDepth',
		type: 'options',
		default: 'standard',
		options: [
			{ name: 'Light', value: 'light' },
			{ name: 'Standard', value: 'standard' },
			{ name: 'Deep', value: 'deep' },
		],
		displayOptions: { show: { operation: ['buildDevelopmentPlan'] } },
	},
	{
		displayName: 'Target Benchmark',
		name: 'targetBenchmark',
		type: 'string',
		default: '',
		placeholder: 'e.g. prestige limited series quality bar',
		description: 'Optional quality benchmark to anchor assumptions',
		displayOptions: { show: { operation: ['buildDevelopmentPlan'] } },
	},
];

export const compileRealmPackageFields: INodeProperties[] = [
	{
		displayName: 'Seed / Brief',
		name: 'seed',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		description: 'The seed or brief to compile into a studio package',
		displayOptions: { show: { operation: ['compileRealmPackage'] } },
	},
	{
		displayName: 'Project Title',
		name: 'projectTitle',
		type: 'string',
		default: '',
		placeholder: 'Optional; derived from the seed when empty',
		description: 'Optional explicit project title',
		displayOptions: { show: { operation: ['compileRealmPackage'] } },
	},
	{
		displayName: 'Package Depth',
		name: 'packageDepth',
		type: 'options',
		default: 'standard',
		options: [
			{ name: 'Skeleton', value: 'skeleton' },
			{ name: 'Standard', value: 'standard' },
			{ name: 'Full', value: 'full' },
		],
		displayOptions: { show: { operation: ['compileRealmPackage'] } },
	},
];

export const generateArtifactPackFields: INodeProperties[] = [
	{
		displayName: 'Seed / Brief',
		name: 'seed',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		description:
			'The seed or brief to expand into ProjectCharter, EvidencePlan, CreativeBible, SceneOutline, GateChecklist, and ExportPackage',
		displayOptions: { show: { operation: ['generateArtifactPack'] } },
	},
	{
		displayName: 'Realm Name',
		name: 'realmName',
		type: 'string',
		default: '',
		description: 'Optional explicit Realm name; derived from seed when empty',
		displayOptions: { show: { operation: ['generateArtifactPack'] } },
	},
	{ ...formatOptions, displayOptions: { show: { operation: ['generateArtifactPack'] } } },
	{
		displayName: 'Runtime (Minutes)',
		name: 'runtimeMinutes',
		type: 'number',
		default: 10,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { operation: ['generateArtifactPack'] } },
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'English',
		displayOptions: { show: { operation: ['generateArtifactPack'] } },
	},
	{
		displayName: 'Audience',
		name: 'audience',
		type: 'string',
		default: '',
		displayOptions: { show: { operation: ['generateArtifactPack'] } },
	},
	{
		displayName: 'Allow Web Research Flag',
		name: 'allowWebResearch',
		type: 'boolean',
		default: false,
		description:
			'Records whether later workflow steps may use web research. This node itself still makes no network calls.',
		displayOptions: { show: { operation: ['generateArtifactPack'] } },
	},
	{
		displayName: 'Max Locations',
		name: 'maxLocations',
		type: 'number',
		default: 3,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { operation: ['generateArtifactPack'] } },
	},
	{
		displayName: 'Max Principal Characters',
		name: 'maxPrincipalCharacters',
		type: 'number',
		default: 4,
		typeOptions: { minValue: 1 },
		displayOptions: { show: { operation: ['generateArtifactPack'] } },
	},
];

export const evaluateGateFields: INodeProperties[] = [
	{
		displayName: 'Gate Name',
		name: 'gateName',
		type: 'options',
		default: 'Charter Approval',
		description: 'The human gate to evaluate against',
		options: [
			{ name: 'Charter Approval', value: 'Charter Approval' },
			{ name: 'Evidence Ledger Sign-Off', value: 'Evidence Ledger Sign-off' },
			{ name: 'Story Kernel Lock', value: 'Story Kernel Lock' },
			{ name: 'Creative Bible Approval', value: 'Creative Bible Approval' },
			{ name: 'Story Architecture Approval', value: 'Story Architecture Approval' },
			{ name: 'Treatment & Scenes Approval', value: 'Treatment & Scenes Approval' },
			{ name: 'Script Lock', value: 'Script Lock' },
			{ name: 'Generic', value: 'Generic' },
		],
		displayOptions: { show: { operation: ['evaluateGate'] } },
	},
	{
		displayName: 'Artifact (JSON or Text)',
		name: 'artifact',
		type: 'string',
		typeOptions: { rows: 6 },
		default: '',
		required: true,
		placeholder: 'Paste the artifact JSON or free text to evaluate',
		description:
			'The artifact under review. JSON enables per-field checks; free text is scored more conservatively.',
		displayOptions: { show: { operation: ['evaluateGate'] } },
	},
	{
		displayName: 'Strictness',
		name: 'strictness',
		type: 'options',
		default: 'standard',
		options: [
			{ name: 'Lenient', value: 'lenient' },
			{ name: 'Standard', value: 'standard' },
			{ name: 'Strict', value: 'strict' },
		],
		displayOptions: { show: { operation: ['evaluateGate'] } },
	},
];
