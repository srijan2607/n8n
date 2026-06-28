import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { Mocked } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

import { InculcateRealms } from '../InculcateRealms.node';
import {
	buildDevelopmentPlan,
	compileRealmPackage,
	createProjectCharter,
	generateArtifactPack,
	evaluateGate,
} from '../operations';

const SEED = 'A lighthouse keeper discovers a drowned city that only appears at low tide';

describe('in.culcate Realms operations (deterministic)', () => {
	describe('createProjectCharter', () => {
		it('produces a charter, kernel, unknowns and the seven gates', () => {
			const result = createProjectCharter({
				seed: SEED,
				format: 'feature',
				runtimeMinutes: 100,
				language: 'en',
				audience: 'streaming drama viewers',
				routeToMarket: 'streaming',
				productionMode: 'liveAction',
				constraints: ['PG-13', 'single location'],
			});

			expect(result.projectCharter.projectId).toMatch(/^proj_[0-9a-f]{8}$/);
			expect(result.projectCharter.title.length).toBeGreaterThan(0);
			expect(result.projectCharter.constraints).toEqual(['PG-13', 'single location']);
			expect(result.storyKernel.provisional).toBe(true);
			expect(result.unknownsRegister.length).toBeGreaterThan(0);
			expect(result.gateChecklist).toHaveLength(7);
			expect(result.gateChecklist.every((gate) => gate.status === 'pending')).toBe(true);
		});

		it('is deterministic for identical seeds', () => {
			const base = {
				seed: SEED,
				format: 'feature' as const,
				runtimeMinutes: 100,
				language: 'en',
				audience: '',
				routeToMarket: 'streaming' as const,
				productionMode: 'liveAction' as const,
				constraints: [],
			};
			expect(createProjectCharter(base)).toEqual(createProjectCharter(base));
		});
	});

	describe('buildDevelopmentPlan', () => {
		it('returns theory, milestones, policy pack, roster and stage contracts', () => {
			const result = buildDevelopmentPlan({
				seed: SEED,
				format: 'series',
				sourceMode: 'original',
				researchDepth: 'standard',
				targetBenchmark: 'prestige limited series',
			});

			expect(result.realmsTheory.studioDirector).toContain('Studio Director');
			expect(result.milestoneTickets.length).toBeGreaterThan(0);
			expect(result.milestoneTickets[0].dependsOn).toEqual([]);
			expect(result.milestoneTickets[1].dependsOn).toEqual([result.milestoneTickets[0].id]);
			expect(result.formatPolicyPack.format).toBe('series');
			expect(result.rolePolicyRoster.length).toBeGreaterThan(0);
			expect(result.stageContracts.length).toBeGreaterThan(0);
		});

		it('uses a reduced artifact set for branded format', () => {
			const result = buildDevelopmentPlan({
				seed: SEED,
				format: 'branded',
				sourceMode: 'brandBrief',
				researchDepth: 'light',
				targetBenchmark: '',
			});
			expect(result.formatPolicyPack.mandatoryArtifacts).not.toContain('EvidenceLedger');
		});
	});

	describe('compileRealmPackage', () => {
		it('produces a full package skeleton with all sub-templates', () => {
			const result = compileRealmPackage({
				seed: SEED,
				projectTitle: 'Tideglass',
				packageDepth: 'full',
			});

			expect(result.developmentHeader.projectTitle).toBe('Tideglass');
			expect(result.developmentHeader.skill).toBe('seed-to-screenplay@1.0.0');
			expect(result.sequenceMapTemplate.structureModel).toBe('Eight-sequence model');
			expect(result.sequenceMapTemplate.beats.length).toBe(8);
			expect(result.sceneCardTemplate.fields).toContain('turn');
			expect(result.decisionLedger.length).toBeGreaterThan(0);
			expect(result.scriptLockRequirements.requirements.length).toBeGreaterThan(0);
			expect(result.narrativeCompilerHandoff.studioIrFields).toContain('scenes');
		});

		it('falls back to a derived title and three-act model for skeleton depth', () => {
			const result = compileRealmPackage({
				seed: SEED,
				projectTitle: '',
				packageDepth: 'skeleton',
			});
			expect(result.developmentHeader.projectTitle.length).toBeGreaterThan(0);
			expect(result.sequenceMapTemplate.structureModel).toBe('Three-act model');
		});
	});

	describe('generateArtifactPack', () => {
		it('produces the full deterministic PRD artifact pack', () => {
			const result = generateArtifactPack({
				seed: SEED,
				realmName: 'Tideglass',
				format: 'short',
				runtimeMinutes: 10,
				language: 'English',
				audience: 'adult genre viewers',
				allowWebResearch: false,
				maxLocations: 3,
				maxPrincipalCharacters: 4,
			});

			expect(result.status).toBe('generated_mock_artifact_pack');
			expect(result.formatPolicyId).toBe('short_film_v1');
			expect(Object.keys(result.artifacts)).toEqual([
				'projectCharter',
				'evidencePlan',
				'creativeBible',
				'sceneOutline',
				'gateChecklist',
			]);
			expect(result.artifactVersions).toHaveLength(5);
			expect(
				result.artifactVersions.every((version) => version.contentHash.startsWith('sha256:')),
			).toBe(true);
			expect(Object.keys(result.schemas)).toContain('ProjectCharter');
			expect(result.openGates).toEqual(['G0', 'G1', 'G2', 'G3', 'G4']);
		});

		it('is deterministic for identical artifact-pack inputs', () => {
			const input = {
				seed: SEED,
				realmName: '',
				format: 'micro' as const,
				runtimeMinutes: 1,
				language: 'English',
				audience: 'vertical viewers',
				allowWebResearch: false,
				maxLocations: 2,
				maxPrincipalCharacters: 3,
			};
			expect(generateArtifactPack(input)).toEqual(generateArtifactPack(input));
		});
	});

	describe('evaluateGate', () => {
		it('APPROVES a complete charter artifact under standard strictness', () => {
			const artifact = {
				title: 'Tideglass',
				seed: SEED,
				format: 'feature',
				runtimeMinutes: 100,
				audience: 'streaming drama viewers',
				routeToMarket: 'streaming',
			};
			const result = evaluateGate({
				gateName: 'Charter Approval',
				artifact,
				artifactText: JSON.stringify(artifact),
				isStructured: true,
				strictness: 'standard',
			});
			expect(result.decision).toBe('APPROVE');
			expect(result.hardBlockers).toHaveLength(0);
			expect(result.score).toBe(1);
		});

		it('REQUEST_MORE when required fields are missing', () => {
			const artifact = { title: 'Tideglass' };
			const result = evaluateGate({
				gateName: 'Charter Approval',
				artifact,
				artifactText: JSON.stringify(artifact),
				isStructured: true,
				strictness: 'standard',
			});
			expect(result.decision).toBe('REQUEST_MORE');
			expect(result.hardBlockers.length).toBeGreaterThan(0);
		});

		it('HOLDs when no artifact text is provided', () => {
			const result = evaluateGate({
				gateName: 'Generic',
				artifact: '',
				artifactText: '',
				isStructured: false,
				strictness: 'standard',
			});
			expect(result.decision).toBe('HOLD');
		});

		it('flags free-text artifacts as a soft risk', () => {
			const result = evaluateGate({
				gateName: 'Story Kernel Lock',
				artifact: 'a short note',
				artifactText: 'a short note',
				isStructured: false,
				strictness: 'standard',
			});
			expect(result.softRisks.length).toBeGreaterThan(0);
		});
	});
});

describe('InculcateRealms node execute', () => {
	let node: InculcateRealms;
	let ctx: Mocked<IExecuteFunctions>;

	beforeEach(() => {
		node = new InculcateRealms();
		ctx = mockDeep<IExecuteFunctions>();
		ctx.getNode.mockReturnValue({
			id: 'realms-node',
			name: 'in.culcate Realms',
			type: 'n8n-nodes-base.inculcateRealms',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		});
		ctx.continueOnFail.mockReturnValue(false);
	});

	it('creates a project charter and preserves pairedItem', async () => {
		ctx.getInputData.mockReturnValue([{ json: {} }]);
		const params: Record<string, unknown> = {
			operation: 'createProjectCharter',
			seed: SEED,
			format: 'feature',
			runtimeMinutes: 100,
			language: 'en',
			audience: 'viewers',
			routeToMarket: 'streaming',
			productionMode: 'liveAction',
			constraints: 'PG-13, single location',
		};
		ctx.getNodeParameter.mockImplementation(
			(name: string, _i: number, fallback?: unknown): object | string | number | boolean => {
				const value = name in params ? params[name] : fallback;
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
					return value;
				if (value === undefined || value === null) return '';
				return value as object;
			},
		);

		const result = await node.execute.call(ctx);
		const out = result[0][0] as INodeExecutionData;
		expect(out.pairedItem).toEqual({ item: 0 });
		expect((out.json.projectCharter as { title: string }).title.length).toBeGreaterThan(0);
	});

	it('executes generate artifact pack operation', async () => {
		ctx.getInputData.mockReturnValue([{ json: {} }]);
		const params: Record<string, unknown> = {
			operation: 'generateArtifactPack',
			seed: SEED,
			realmName: 'Tideglass',
			format: 'short',
			runtimeMinutes: 10,
			language: 'English',
			audience: 'viewers',
			allowWebResearch: false,
			maxLocations: 3,
			maxPrincipalCharacters: 4,
		};
		ctx.getNodeParameter.mockImplementation(
			(name: string, _i: number, fallback?: unknown): object | string | number | boolean => {
				const value = name in params ? params[name] : fallback;
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
					return value;
				if (value === undefined || value === null) return '';
				return value as object;
			},
		);

		const result = await node.execute.call(ctx);
		expect(result[0][0].json.status).toBe('generated_mock_artifact_pack');
		expect((result[0][0].json.artifactVersions as unknown[]).length).toBe(5);
	});

	it('throws NodeOperationError on malformed JSON artifact', async () => {
		ctx.getInputData.mockReturnValue([{ json: {} }]);
		const params: Record<string, unknown> = {
			operation: 'evaluateGate',
			gateName: 'Charter Approval',
			artifact: '{ "title": "broken" ', // invalid JSON
			strictness: 'standard',
		};
		ctx.getNodeParameter.mockImplementation(
			(name: string, _i: number, fallback?: unknown): object | string | number | boolean => {
				const value = name in params ? params[name] : fallback;
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
					return value;
				if (value === undefined || value === null) return '';
				return value as object;
			},
		);

		await expect(node.execute.call(ctx)).rejects.toThrow(NodeOperationError);
	});

	it('throws NodeOperationError when seed is empty', async () => {
		ctx.getInputData.mockReturnValue([{ json: {} }]);
		const params: Record<string, unknown> = { operation: 'createProjectCharter', seed: '   ' };
		ctx.getNodeParameter.mockImplementation(
			(name: string, _i: number, fallback?: unknown): object | string | number | boolean => {
				const value = name in params ? params[name] : fallback;
				if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
					return value;
				if (value === undefined || value === null) return '';
				return value as object;
			},
		);

		await expect(node.execute.call(ctx)).rejects.toThrow(NodeOperationError);
	});
});
