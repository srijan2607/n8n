import type {
	Assumption,
	BuildDevelopmentPlanResult,
	CharterInput,
	CompileRealmPackageResult,
	CreateProjectCharterResult,
	EvaluateGateResult,
	FormatPolicyPack,
	ArtifactPackFormatPolicy,
	ArtifactPackInput,
	ArtifactVersionEnvelope,
	GenerateArtifactPackResult,
	GateBlocker,
	GateDecision,
	GateNextAction,
	GateRisk,
	MilestoneTicket,
	PackageDepth,
	ResearchDepth,
	RolePolicyEntry,
	ScreenFormat,
	SourceMode,
	StageContract,
	StoryKernel,
	Strictness,
	UnknownEntry,
} from './types';
import {
	canonicalGates,
	deriveTitle,
	firstSentence,
	keywords,
	realmsTheory,
	structuredId,
	sha256Canonical,
} from './helpers';

// Each function is a pure, deterministic transform: identical inputs always
// produce identical studio artifacts. No clock, no randomness, no I/O.

// ---------------------------------------------------------------------------
// Operation 1: createProjectCharter
// ---------------------------------------------------------------------------

function buildStoryKernel(seed: string): StoryKernel {
	const kws = keywords(seed);
	const premise = firstSentence(seed) || 'Provisional premise pending Creative Room synthesis.';
	return {
		kernelId: structuredId('kernel', seed),
		provisional: true,
		premise,
		protagonistHypothesis:
			kws.length > 0
				? `A protagonist defined by "${kws[0]}" with something concrete at stake.`
				: 'Protagonist hypothesis pending discovery.',
		centralTension:
			kws.length > 1
				? `Tension between "${kws[0]}" and "${kws[1]}".`
				: 'Central tension to be established during research.',
		thematicQuestion:
			kws.length > 0
				? `What does "${kws[0]}" cost, and is it worth paying?`
				: 'Thematic question to be discovered.',
		toneKeywords: kws,
	};
}

function buildUnknownsRegister(input: CharterInput): UnknownEntry[] {
	const defs: Array<{
		key: string;
		question: string;
		category: string;
		severity: UnknownEntry['severity'];
	}> = [
		{
			key: 'audience',
			question: 'Who exactly is the target audience and what do they currently watch?',
			category: 'market',
			severity: input.audience ? 'low' : 'high',
		},
		{
			key: 'differentiation',
			question: 'What makes this distinct from the closest comparable titles?',
			category: 'creative',
			severity: 'high',
		},
		{
			key: 'feasibility',
			question: `Is the story achievable in ${input.runtimeMinutes} minutes in ${input.productionMode} mode?`,
			category: 'production',
			severity: 'medium',
		},
		{
			key: 'rights',
			question: 'Are all source materials and references cleared for the intended route to market?',
			category: 'rights',
			severity: 'medium',
		},
		{
			key: 'evidence',
			question: 'Which factual claims need an Evidence Ledger entry before the kernel can lock?',
			category: 'research',
			severity: 'medium',
		},
	];
	return defs.map((def) => ({
		id: structuredId('unk', input.seed, def.key),
		question: def.question,
		category: def.category,
		severity: def.severity,
		status: 'open' as const,
	}));
}

export function createProjectCharter(input: CharterInput): CreateProjectCharterResult {
	const title = deriveTitle(input.seed);
	const projectId = structuredId('proj', input.seed);

	return {
		projectCharter: {
			projectId,
			title,
			seed: input.seed,
			format: input.format,
			runtimeMinutes: input.runtimeMinutes,
			language: input.language,
			audience: input.audience,
			routeToMarket: input.routeToMarket,
			productionMode: input.productionMode,
			constraints: input.constraints,
			stage: 'Stage 0 — Intake, Sūtra & Project Charter',
			studioDirector: {
				role: 'Studio Director',
				authority: 'Sole authority over creative direction and all locks',
				description:
					'The human directs development; RolePolicies execute under direction with inspectable provenance.',
			},
			governance: [
				{
					id: structuredId('gov', input.seed, 'inspectable'),
					principle:
						'Every artifact, decision, dependency, right, cost, and evaluation remains inspectable.',
				},
				{
					id: structuredId('gov', input.seed, 'local-first'),
					principle: 'Local-first Project Vault; chat history is never treated as storage.',
				},
				{
					id: structuredId('gov', input.seed, 'gates'),
					principle: 'Human gates control high-leverage authorial decisions and all locks.',
				},
				{
					id: structuredId('gov', input.seed, 'replayable'),
					principle: 'Decisions and routing are explicit and replayable in the Decision Graph.',
				},
			],
		},
		storyKernel: buildStoryKernel(input.seed),
		unknownsRegister: buildUnknownsRegister(input),
		gateChecklist: canonicalGates(input.seed),
	};
}

// ---------------------------------------------------------------------------
// Operation 2: buildDevelopmentPlan
// ---------------------------------------------------------------------------

const FORMAT_DEFAULTS: Record<
	ScreenFormat,
	{ structure: string; hook: number; minutes: number; gates: number }
> = {
	feature: { structure: 'Three-act feature architecture', hook: 90, minutes: 100, gates: 7 },
	series: { structure: 'Season arc with per-episode engines', hook: 60, minutes: 45, gates: 7 },
	short: { structure: 'Single dramatic movement', hook: 20, minutes: 12, gates: 5 },
	branded: { structure: 'Hook-led brand narrative', hook: 5, minutes: 1, gates: 4 },
	documentary: { structure: 'Evidence-driven thesis structure', hook: 45, minutes: 70, gates: 6 },
	micro: { structure: 'Compressed single-beat hook', hook: 3, minutes: 1, gates: 3 },
};

function buildFormatPolicyPack(seed: string, format: ScreenFormat): FormatPolicyPack {
	const defaults = FORMAT_DEFAULTS[format];
	return {
		packId: structuredId('fpp', seed, format),
		format,
		mandatoryArtifacts:
			format === 'branded' || format === 'micro'
				? ['ProjectCharter', 'StoryKernel', 'SceneCard[]', 'ScriptLock']
				: [
						'ProjectCharter',
						'EvidenceLedger',
						'StoryKernel',
						'CreativeBible',
						'SequenceMap',
						'SceneCard[]',
						'ScriptLock',
					],
		structuralDefault: defaults.structure,
		hookCadenceSeconds: defaults.hook,
		targetLengthMinutes: defaults.minutes,
		gateCount: defaults.gates,
		evaluationWeights: {
			story: 0.4,
			character: 0.2,
			structure: 0.2,
			evidence: 0.1,
			production: 0.1,
		},
	};
}

function buildRolePolicyRoster(seed: string): RolePolicyEntry[] {
	const defs: Array<Omit<RolePolicyEntry, 'roleId'> & { key: string }> = [
		{
			key: 'sutra',
			name: 'Sūtra',
			workerClass: 'PlannerRouter',
			room: 'Intake',
			producesArtifact: 'ProjectCharter',
			authority: 'Routes work; cannot author canon',
		},
		{
			key: 'researcher',
			name: 'Evidence Researcher',
			workerClass: 'ResearchWorker',
			room: 'Research',
			producesArtifact: 'EvidenceLedger',
			authority: 'Proposes cited evidence',
		},
		{
			key: 'story_architect',
			name: 'Story Architect',
			workerClass: 'CreativeWorker',
			room: 'Creative Room',
			producesArtifact: 'StoryConstitution',
			authority: 'Proposes architecture',
		},
		{
			key: 'world_culture',
			name: 'World & Culture Architect',
			workerClass: 'CreativeWorker',
			room: 'Creative Room',
			producesArtifact: 'WorldBible',
			authority: 'Proposes world bible',
		},
		{
			key: 'visual_sonic',
			name: 'Visual & Sonic Designer',
			workerClass: 'CreativeWorker',
			room: 'Creative Room',
			producesArtifact: 'VisualSonicGrammar',
			authority: 'Proposes grammar',
		},
		{
			key: 'scene_designer',
			name: 'Scene Designer',
			workerClass: 'CreativeWorker',
			room: 'Pre-screenplay',
			producesArtifact: 'SceneCard[]',
			authority: 'Proposes scenes',
		},
		{
			key: 'lead_writer',
			name: 'Lead Screenwriter',
			workerClass: 'CreativeWorker',
			room: 'Screenplay',
			producesArtifact: 'Screenplay',
			authority: 'Owns canonical voice and locked draft',
		},
		{
			key: 'critic',
			name: 'Table-Read Critic',
			workerClass: 'CriticWorker',
			room: 'Critique',
			producesArtifact: 'CritiqueNotes',
			authority: 'Evaluates; cannot edit canon',
		},
		{
			key: 'compiler',
			name: 'Narrative Compiler',
			workerClass: 'CompilerWorker',
			room: 'Compile',
			producesArtifact: 'StudioIR',
			authority: 'Compiles approved intent',
		},
		{
			key: 'governor',
			name: 'Lock Authority',
			workerClass: 'GovernanceWorker',
			room: 'Governance',
			producesArtifact: 'GateDisposition',
			authority: 'Enforces gates and locks under the Director',
		},
	];
	return defs.map(({ key, ...rest }) => ({ roleId: structuredId('role', seed, key), ...rest }));
}

function buildStageContracts(seed: string): StageContract[] {
	const defs: Array<Omit<StageContract, 'stageId'> & { key: string }> = [
		{
			key: 's0',
			name: 'Stage 0 — Intake & Charter',
			inputs: ['seed', 'intent'],
			outputs: ['ProjectCharter', 'StoryKernel(provisional)'],
			gate: 'Charter Approval',
			failureModes: ['Vague intent', 'Missing constraints'],
		},
		{
			key: 's2',
			name: 'Stage 2 — Research & Evidence Ledger',
			inputs: ['Charter', 'Unknowns'],
			outputs: ['EvidenceLedger'],
			gate: 'Evidence Ledger Sign-off',
			failureModes: ['Uncited claims', 'Unresolved risks'],
		},
		{
			key: 's3',
			name: 'Stage 3 — Story Kernel',
			inputs: ['EvidenceLedger'],
			outputs: ['StoryKernel(locked)'],
			gate: 'Story Kernel Lock',
			failureModes: ['Premise still provisional'],
		},
		{
			key: 's4',
			name: 'Stage 4 — Creative Room',
			inputs: ['StoryKernel'],
			outputs: ['CreativeBible'],
			gate: 'Creative Bible Approval',
			failureModes: ['Incoherent world', 'Unjustified characters'],
		},
		{
			key: 's5',
			name: 'Stage 5 — Story Architecture',
			inputs: ['CreativeBible'],
			outputs: ['SequenceMap'],
			gate: 'Story Architecture Approval',
			failureModes: ['Structural redundancy', 'Missing turns'],
		},
		{
			key: 's6',
			name: 'Stage 6 — Treatment & Scenes',
			inputs: ['SequenceMap'],
			outputs: ['SceneCard[]', 'Treatment'],
			gate: 'Treatment & Scenes Approval',
			failureModes: ['Scene redundancy', 'Missing turn'],
		},
		{
			key: 's11',
			name: 'Stage 11 — Script Lock',
			inputs: ['ApprovedDraft'],
			outputs: ['ScriptLockPackage'],
			gate: 'Script Lock',
			failureModes: ['Unresolved notes', 'No change policy'],
		},
	];
	return defs.map(({ key, ...rest }) => ({ stageId: structuredId('stage', seed, key), ...rest }));
}

function buildMilestones(seed: string): MilestoneTicket[] {
	const contracts = buildStageContracts(seed);
	return contracts.map((contract, index) => ({
		id: structuredId('mile', seed, `m${index}`),
		title: `Complete ${contract.name}`,
		stage: contract.name,
		dependsOn: index === 0 ? [] : [structuredId('mile', seed, `m${index - 1}`)],
		deliverable: contract.outputs.join(', '),
	}));
}

function buildAssumptions(
	seed: string,
	sourceMode: SourceMode,
	researchDepth: ResearchDepth,
	benchmark: string,
): Assumption[] {
	const defs: Array<{ key: string; statement: string; confidence: Assumption['confidence'] }> = [
		{
			key: 'source',
			statement: `Material is treated as a ${sourceMode} project for rights and structure purposes.`,
			confidence: 'high',
		},
		{
			key: 'depth',
			statement: `Research effort is scoped to "${researchDepth}" depth before kernel lock.`,
			confidence: 'medium',
		},
		{
			key: 'benchmark',
			statement: benchmark
				? `Target quality benchmark is "${benchmark}".`
				: 'No explicit benchmark supplied; default to category-best comparable.',
			confidence: benchmark ? 'high' : 'low',
		},
		{
			key: 'offline',
			statement:
				'All planning is deterministic and offline; no external generation is assumed at this stage.',
			confidence: 'high',
		},
	];
	return defs.map((def) => ({
		id: structuredId('assume', seed, def.key),
		statement: def.statement,
		confidence: def.confidence,
	}));
}

export interface DevelopmentPlanInput {
	seed: string;
	format: ScreenFormat;
	sourceMode: SourceMode;
	researchDepth: ResearchDepth;
	targetBenchmark: string;
}

export function buildDevelopmentPlan(input: DevelopmentPlanInput): BuildDevelopmentPlanResult {
	return {
		realmsTheory: realmsTheory(),
		assumptions: buildAssumptions(
			input.seed,
			input.sourceMode,
			input.researchDepth,
			input.targetBenchmark,
		),
		milestoneTickets: buildMilestones(input.seed),
		formatPolicyPack: buildFormatPolicyPack(input.seed, input.format),
		rolePolicyRoster: buildRolePolicyRoster(input.seed),
		stageContracts: buildStageContracts(input.seed),
	};
}

// ---------------------------------------------------------------------------
// Operation 3: compileRealmPackage
// ---------------------------------------------------------------------------

export interface RealmPackageInput {
	seed: string;
	projectTitle: string;
	packageDepth: PackageDepth;
}

export function compileRealmPackage(input: RealmPackageInput): CompileRealmPackageResult {
	const title =
		input.projectTitle.trim().length > 0 ? input.projectTitle.trim() : deriveTitle(input.seed);
	const projectId = structuredId('proj', input.seed);
	const kws = keywords(input.seed);
	const premise = firstSentence(input.seed) || 'Provisional premise pending synthesis.';
	const full = input.packageDepth === 'full';

	return {
		developmentHeader: {
			packageId: structuredId('pkg', input.seed, input.packageDepth),
			projectId,
			projectTitle: title,
			seed: input.seed,
			packageDepth: input.packageDepth,
			skill: 'seed-to-screenplay@1.0.0',
			generatedStage: 'Development (deterministic skeleton)',
		},
		storyMaterials: {
			premise,
			logline:
				kws.length > 1
					? `In a world shaped by ${kws[0]}, a protagonist confronts ${kws[1]}.`
					: premise,
			synopsisSkeleton: [
				'Setup and ordinary world',
				'Inciting incident',
				'Rising complications',
				'Crisis and reversal',
				'Climax and resolution',
			],
			themeStatement:
				kws.length > 0 ? `The cost and worth of ${kws[0]}.` : 'Theme to be discovered.',
			toneKeywords: kws,
		},
		evidenceLedgerTemplate: {
			ledgerId: structuredId('ledger', input.seed),
			columns: ['claim', 'source', 'sourceType', 'confidence', 'usedIn', 'disposition'],
			entryTemplate: {
				claim: '',
				source: '',
				sourceType: 'primary|secondary|expert',
				confidence: 'low|medium|high',
				usedIn: '',
				disposition: 'open',
			},
			citationPolicy:
				'Every factual claim that affects the kernel must cite at least one source before Evidence Ledger Sign-off.',
		},
		creativeBibleTemplate: {
			bibleId: structuredId('bible', input.seed),
			sections: [
				'World',
				'Culture',
				'Characters',
				'Visual Grammar',
				'Sonic Grammar',
				'Rules & Constraints',
			],
			worldFields: ['setting', 'era', 'rules', 'tone', 'visualMotifs'],
			characterFields: ['name', 'want', 'need', 'flaw', 'arc', 'relationships'],
		},
		sequenceMapTemplate: {
			mapId: structuredId('seqmap', input.seed),
			structureModel: full ? 'Eight-sequence model' : 'Three-act model',
			beats: (full
				? [
						'Opening Image',
						'Inciting Incident',
						'First Turn',
						'Midpoint',
						'Second Turn',
						'Crisis',
						'Climax',
						'Resolution',
					]
				: ['Setup', 'Confrontation', 'Resolution']
			).map((label, index) => ({
				id: structuredId('beat', input.seed, `${index}`),
				label,
				purpose: '',
			})),
		},
		sceneCardTemplate: {
			cardId: structuredId('scene', input.seed),
			fields: [
				'sceneId',
				'slugline',
				'location',
				'time',
				'characters',
				'goal',
				'conflict',
				'turn',
				'outcome',
				'evidenceRefs',
			],
			example: {
				sceneId: 'scene-001',
				slugline: 'INT. PLACE - DAY',
				location: 'Place',
				time: 'Day',
				characters: 'Protagonist',
				goal: '',
				conflict: '',
				turn: '',
				outcome: '',
				evidenceRefs: '',
			},
		},
		decisionLedger: [
			{
				decisionId: structuredId('dec', input.seed, 'format'),
				question: 'Is the chosen format and length correct for the intent?',
				options: ['Confirm', 'Revise format', 'Revise length'],
				status: 'open',
				owner: 'Studio Director',
			},
			{
				decisionId: structuredId('dec', input.seed, 'kernel'),
				question: 'Is the story kernel ready to lock?',
				options: ['Lock', 'Request more evidence', 'Revise'],
				status: 'open',
				owner: 'Studio Director',
			},
		],
		scriptLockRequirements: {
			lockId: structuredId('lock', input.seed),
			requirements: [
				'Approved draft',
				'Resolved or deferred notes with rationale',
				'Evidence Ledger reconciled',
				'Creative Bible consistency check',
				'Change policy acknowledged',
			],
			changePolicy:
				'After lock, changes become controlled change requests with cost and schedule impact; lock does not mean the work can never change.',
		},
		narrativeCompilerHandoff: {
			handoffId: structuredId('handoff', input.seed),
			studioIrFields: ['scenes', 'shots', 'entities', 'continuity', 'intent'],
			regenerableUnits: ['shot', 'scene'],
			note: 'The Narrative Compiler converts the approved screenplay and production intent into typed, selectively regenerable StudioIR. A screenplay scene is a dramatic unit, not a fixed-duration shot.',
		},
	};
}

// ---------------------------------------------------------------------------
// Operation 4: generateArtifactPack
// ---------------------------------------------------------------------------

const SCHEMA_NAMES = [
	'ProjectCharter',
	'EvidencePlan',
	'CreativeBible',
	'SceneOutline',
	'GateChecklist',
	'ExportPackage',
	'ArtifactVersion',
	'ValidationResult',
] as const;

function selectFormatPolicy(
	format: ScreenFormat,
	runtimeMinutes: number,
): ArtifactPackFormatPolicy {
	if (format === 'micro' || runtimeMinutes <= 2) return 'microdrama_v1';
	if (format === 'branded' || runtimeMinutes <= 5) return 'branded_short_v1';
	if (format === 'series') return 'series_v1';
	if (format === 'feature') return 'feature_v1';
	return 'short_film_v1';
}

function sceneCountForPolicy(policy: ArtifactPackFormatPolicy): number {
	if (policy === 'microdrama_v1') return 5;
	if (policy === 'branded_short_v1') return 6;
	if (policy === 'short_film_v1') return 10;
	if (policy === 'series_v1') return 8;
	return 12;
}

function buildSchema(name: string): Record<string, unknown> {
	return {
		$id: `https://inculcate.local/schemas/${name}.schema.json`,
		$schema: 'https://json-schema.org/draft/2020-12/schema',
		title: name,
		type: 'object',
		additionalProperties: true,
		required:
			name === 'ProjectCharter' ? ['projectId', 'realmName', 'formatPolicyId'] : ['projectId'],
	};
}

function makeEnvelope(
	projectId: string,
	artifactId: string,
	type: string,
	content: unknown,
	sourceVersionIds: string[] = [],
): ArtifactVersionEnvelope {
	return {
		artifactVersionId: structuredId('av', `${projectId}:${artifactId}:${sha256Canonical(content)}`),
		artifactId,
		projectId,
		type,
		version: 1,
		status: 'generated',
		contentHash: sha256Canonical(content),
		sourceVersionIds,
		createdBy: {
			type: 'deterministic_realms_node',
			workflow: 'inculcateRealms.generateArtifactPack',
		},
	};
}

export function generateArtifactPack(input: ArtifactPackInput): GenerateArtifactPackResult {
	const projectId = structuredId('proj', input.seed);
	const formatPolicyId = selectFormatPolicy(input.format, input.runtimeMinutes);
	const title =
		input.realmName.trim().length > 0 ? input.realmName.trim() : deriveTitle(input.seed);
	const kws = keywords(input.seed, 8);
	const sceneTotal = sceneCountForPolicy(formatPolicyId);
	const principalCharacterCount = Math.max(2, Math.min(input.maxPrincipalCharacters, 4));
	const locationCount = Math.max(1, Math.min(input.maxLocations, 4));

	const projectCharter = {
		projectId,
		realmName: title,
		entryPath: 'seed',
		formatPolicyId,
		format: input.format,
		runtimeTargetMinutes: input.runtimeMinutes,
		language: input.language,
		targetAudience: input.audience,
		sourceMaterial: {
			status: 'original',
			rightsStatus: 'not_applicable',
			rightsWarnings: [] as string[],
		},
		privacyPolicy: {
			allowExternalLlm: false,
			allowWebResearch: input.allowWebResearch,
			dataEgressNotes: ['This deterministic node makes no network calls and uses no credentials.'],
		},
		productionConstraints: {
			complexityTarget: locationCount <= 3 ? 'contained' : 'moderate',
			maxLocations: input.maxLocations,
			maxPrincipalCharacters: input.maxPrincipalCharacters,
		},
		unknownsRegister: [
			{
				field: 'audience',
				question: 'Which parent/viewer segment is the first buyer?',
				blocksNextStage: false,
			},
			{
				field: 'evidence',
				question: 'Which claims must be sourced before lock?',
				blocksNextStage: true,
			},
			{
				field: 'rights',
				question: 'Are any references adaptations or living-person claims?',
				blocksNextStage: true,
			},
		],
	};

	const evidencePlan = {
		projectId,
		planId: structuredId('eplan', input.seed),
		researchMode: input.allowWebResearch ? 'lightweight' : 'none',
		questions: [
			{
				questionId: structuredId('rq', input.seed, 'audience'),
				question: 'What does the audience already love in this format?',
				whyItMattersToStory: 'Prevents generic genre imitation and anchors the hook.',
				lane: 'audience_comparable',
				priority: 'high',
				webResearchAllowed: input.allowWebResearch,
				storyUse: 'ending_pressure',
			},
			{
				questionId: structuredId('rq', input.seed, 'feasibility'),
				question: 'Can the story be staged within the location and character cap?',
				whyItMattersToStory: 'Forces production-aware scene design.',
				lane: 'production_feasibility',
				priority: 'high',
				webResearchAllowed: false,
				storyUse: 'scene_image',
			},
		],
		blockedClaims: ['No legal clearance conclusion is generated by this node.'],
	};

	const characters = Array.from({ length: principalCharacterCount }, (_, index) => ({
		characterId: structuredId('char', input.seed, `${index}`),
		name: index === 0 ? 'Protagonist' : `Principal ${index + 1}`,
		dramaticFunction: index === 0 ? 'focal protagonist' : 'pressure / foil',
		outerWant:
			index === 0
				? `Solve the ${kws[0] ?? 'central'} problem`
				: 'Apply pressure to the protagonist',
		innerNeed: 'Discover the cost of the central choice',
		flaw: 'Defined in Creative Room',
		fear: 'Defined in Creative Room',
		behavioralTells: ['specific repeated action', 'speech rhythm marker'],
		startState: 'Unresolved',
		endState: 'Changed by the final choice',
	}));

	const creativeBible = {
		projectId,
		creativeBibleId: structuredId('bible', input.seed),
		storyConstitution: {
			premise: firstSentence(input.seed),
			centralDramaticQuestion: kws[0]
				? `Can the protagonist confront ${kws[0]} before the cost becomes irreversible?`
				: 'Can the protagonist make the irreversible choice?',
			thematicArgument: 'Meaning is proven through choices under pressure.',
			thematicCounterargument: 'Survival may require compromise.',
			oppositionLogic: 'Every solution increases personal or moral cost.',
			endingPrinciple:
				'The ending must answer the dramatic question through action, not exposition.',
			forbiddenMoves: [
				'No AI-generated legal conclusion',
				'No screenplay lock without human approval',
			],
		},
		characters,
		worldBible: {
			locations: Array.from({ length: locationCount }, (_, index) => `Location ${index + 1}`),
			rules: ['World rules must be visible through scene pressure.'],
			sensoryPalette: kws.slice(0, 4),
		},
		visualSonicGrammar: {
			visualThesis: `Images should externalize ${kws[0] ?? 'pressure'} rather than decorate the story.`,
			motifs: kws.slice(0, 3),
			prohibitions: ['generic cinematic mood language', 'named living creator imitation'],
		},
		unresolvedTensions: ['Character contradictions need human review before draft.'],
	};

	const scenes = Array.from({ length: sceneTotal }, (_, index) => {
		const order = index + 1;
		return {
			sceneId: `sc_${String(order).padStart(3, '0')}`,
			sequenceId: `seq_${String(Math.ceil(order / 3)).padStart(2, '0')}`,
			order,
			sluglineProposal: `INT./EXT. LOCATION ${(index % locationCount) + 1} - TIME`,
			purpose: order === 1 ? 'Open with pressure and promise' : 'Escalate, reveal, or force choice',
			povCharacterId: characters[0].characterId,
			participatingCharacterIds: characters
				.slice(0, Math.min(characters.length, 2 + (index % 2)))
				.map((c) => c.characterId),
			conflict: `A concrete obstacle blocks objective ${order}.`,
			turn: `The scene turns when new information changes the next choice ${order}.`,
			valueShift: index % 2 === 0 ? 'safety → danger' : 'certainty → doubt',
			estimatedRuntimeMinutes: Math.max(
				0.5,
				Math.round((input.runtimeMinutes / sceneTotal) * 10) / 10,
			),
			necessityTest: {
				functions: ['advance_action', 'force_choice', 'reveal_character'],
				passes: true,
			},
		};
	});

	const sceneOutline = {
		projectId,
		sceneOutlineId: structuredId('outline', input.seed),
		formatPolicyId,
		estimatedTotalRuntimeMinutes: scenes.reduce(
			(sum, scene) => sum + scene.estimatedRuntimeMinutes,
			0,
		),
		scenes,
	};

	const gateChecklist = {
		projectId,
		gates: [
			'G0 Charter Approval',
			'G1 Evidence Plan Approval',
			'G2 Creative Bible Approval',
			'G3 Scene Outline Lock',
			'G4 Export Package Approval',
		].map((name, index) => ({
			gateId: name.slice(0, 2),
			name,
			decisionQuestion: `Should ${name} proceed?`,
			requiredArtifacts:
				index === 0
					? ['ProjectCharter']
					: index === 1
						? ['EvidencePlan']
						: index === 2
							? ['CreativeBible']
							: index === 3
								? ['SceneOutline']
								: ['ExportPackage'],
			validationStatus: 'warn',
			openIssues: ['Pending human approval'],
			humanDecisionOptions: ['approve', 'edit', 'branch', 'reject', 'defer'],
			decisionRecord: { status: 'pending' },
		})),
	};

	const artifacts: Record<string, unknown> = {
		projectCharter,
		evidencePlan,
		creativeBible,
		sceneOutline,
		gateChecklist,
	};

	const schemas = Object.fromEntries(SCHEMA_NAMES.map((name) => [name, buildSchema(name)]));
	const artifactVersions = Object.entries(artifacts).map(([artifactId, content]) =>
		makeEnvelope(projectId, artifactId, artifactId[0].toUpperCase() + artifactId.slice(1), content),
	);
	const checksums = Object.fromEntries(
		Object.entries(artifacts).map(([artifactId, content]) => [
			artifactId,
			sha256Canonical(content),
		]),
	);

	const exportPackage = {
		projectId,
		exportPackageId: structuredId('export', input.seed),
		workflowName: 'inculcateRealms.generateArtifactPack',
		artifacts: artifactVersions.map((version) => ({
			artifactType: version.type,
			jsonPath: `artifacts/${version.artifactId}.json`,
			markdownPath: `markdown/${version.artifactId}.md`,
			schemaPath: `schemas/${version.type}.schema.json`,
			contentHash: version.contentHash,
		})),
		openGates: gateChecklist.gates.map((gate) => gate.gateId),
		warnings: ['Generated in deterministic mock mode; not a locked screenplay or legal clearance.'],
	};

	return {
		projectId,
		formatPolicyId,
		status: 'generated_mock_artifact_pack',
		artifacts,
		artifactVersions,
		schemas,
		exportPackage,
		checksums,
		openGates: gateChecklist.gates.map((gate) => gate.gateId),
		validationSummary: {
			hardErrors: [],
			warnings: [
				'Human gates are pending',
				'No external research was performed by this offline node',
			],
		},
	};
}

// ---------------------------------------------------------------------------
// Operation 5: evaluateGate
// ---------------------------------------------------------------------------

// Required artifact fields keyed by a normalized gate identifier. The evaluator
// is deterministic: it inspects which required fields are present and non-empty.
const GATE_REQUIREMENTS: Record<string, string[]> = {
	charter: ['title', 'seed', 'format', 'runtimeMinutes', 'audience', 'routeToMarket'],
	evidence: ['claim', 'source', 'confidence'],
	kernel: ['premise', 'centralTension', 'thematicQuestion'],
	bible: ['world', 'characters', 'visualGrammar'],
	architecture: ['beats', 'structureModel'],
	scenes: ['sceneId', 'slugline', 'goal', 'conflict', 'turn'],
	scriptlock: ['draft', 'notes', 'changePolicy'],
	generic: [],
};

function normalizeGateKey(gateName: string): string {
	const lower = gateName.toLowerCase();
	if (lower.includes('charter')) return 'charter';
	if (lower.includes('evidence')) return 'evidence';
	if (lower.includes('kernel')) return 'kernel';
	if (lower.includes('bible')) return 'bible';
	if (lower.includes('architecture')) return 'architecture';
	if (lower.includes('scene') || lower.includes('treatment')) return 'scenes';
	if (lower.includes('lock')) return 'scriptlock';
	return 'generic';
}

function isFieldPresent(artifact: unknown, field: string): boolean {
	if (artifact === null || typeof artifact !== 'object') return false;
	const record = artifact as Record<string, unknown>;
	if (!Object.prototype.hasOwnProperty.call(record, field)) return false;
	const value = record[field];
	if (value === null || value === undefined) return false;
	if (typeof value === 'string') return value.trim().length > 0;
	if (Array.isArray(value)) return value.length > 0;
	return true;
}

export interface EvaluateGateInput {
	gateName: string;
	artifact: unknown;
	artifactText: string;
	isStructured: boolean;
	strictness: Strictness;
}

export function evaluateGate(input: EvaluateGateInput): EvaluateGateResult {
	const gateKey = normalizeGateKey(input.gateName);
	const required = GATE_REQUIREMENTS[gateKey] ?? [];
	const idSeed = `${input.gateName}:${input.artifactText}`;

	const hardBlockers: GateBlocker[] = [];
	const softRisks: GateRisk[] = [];
	const nextActions: GateNextAction[] = [];

	let presentCount = 0;
	for (const field of required) {
		if (isFieldPresent(input.artifact, field)) {
			presentCount += 1;
		} else {
			hardBlockers.push({
				id: structuredId('block', idSeed, field),
				missingField: field,
				reason: `Required field "${field}" is missing or empty for gate "${input.gateName}".`,
			});
			nextActions.push({
				id: structuredId('act', idSeed, field),
				action: `Provide "${field}" in the artifact.`,
			});
		}
	}

	// Coverage score: fraction of required fields satisfied (1 when no schema).
	const coverage = required.length === 0 ? 1 : presentCount / required.length;

	// Thin free-text artifacts are a soft risk even when no schema applies.
	if (!input.isStructured) {
		softRisks.push({
			id: structuredId('risk', idSeed, 'unstructured'),
			field: 'artifact',
			note: 'Artifact is free text, not structured JSON; automated field checks are limited.',
		});
		if (input.artifactText.trim().length < 40) {
			softRisks.push({
				id: structuredId('risk', idSeed, 'thin'),
				field: 'artifact',
				note: 'Artifact is very short; it likely lacks the depth a gate review needs.',
			});
		}
	}

	// Strictness shifts the approval/revise thresholds.
	const thresholds: Record<Strictness, { approve: number; revise: number }> = {
		lenient: { approve: 0.7, revise: 0.4 },
		standard: { approve: 0.85, revise: 0.6 },
		strict: { approve: 1, revise: 0.75 },
	};
	const { approve, revise } = thresholds[input.strictness];

	let decision: GateDecision;
	if (input.artifactText.trim().length === 0) {
		decision = 'HOLD';
		nextActions.unshift({
			id: structuredId('act', idSeed, 'supply'),
			action: 'Supply an artifact to evaluate.',
		});
	} else if (hardBlockers.length > 0 && coverage < revise) {
		decision = 'REQUEST_MORE';
	} else if (coverage >= approve && hardBlockers.length === 0) {
		decision = 'APPROVE';
	} else if (coverage >= revise) {
		decision = 'REVISE';
	} else {
		decision = 'REQUEST_MORE';
	}

	if (decision === 'APPROVE' && softRisks.length > 0 && input.strictness === 'strict') {
		decision = 'REVISE';
		nextActions.push({
			id: structuredId('act', idSeed, 'resolve-risks'),
			action: 'Resolve soft risks before approval under strict review.',
		});
	}

	// Confidence is higher when the artifact is structured and the schema is known.
	const schemaKnown = gateKey !== 'generic';
	const confidence =
		Math.round(
			Math.min(1, (input.isStructured ? 0.6 : 0.3) + (schemaKnown ? 0.3 : 0.1) + coverage * 0.1) *
				100,
		) / 100;

	const summary =
		decision === 'APPROVE'
			? `Gate "${input.gateName}" meets the ${input.strictness} bar (${Math.round(coverage * 100)}% coverage).`
			: `Gate "${input.gateName}" returned ${decision} at ${Math.round(coverage * 100)}% coverage with ${hardBlockers.length} blocker(s).`;

	return {
		gateName: input.gateName,
		decision,
		score: Math.round(coverage * 100) / 100,
		confidence,
		strictness: input.strictness,
		hardBlockers,
		softRisks,
		nextActions,
		summary,
	};
}
