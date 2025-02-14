import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useContractWrite } from 'wagmi';

import Button from 'components/Button';
import { monitorTransaction } from 'contexts/RelayerContext';
import { useStakingContext } from 'contexts/StakingContext';
import { getStakingApy } from 'queries/staking/utils';
import media from 'styles/media';
import { formatPercent, truncateNumbers } from 'utils/formatters/number';

import { KwentaLabel, StakingCard } from './common';
import StakeInputCard from './InputCards/StakeInputCard';

const StakingTab = () => {
	const { t } = useTranslation();
	const {
		claimableBalance,
		totalStakedBalance,
		weekCounter,
		getRewardConfig,
		resetStakingState,
		resetVesting,
		resetVestingClaimable,
	} = useStakingContext();

	const apy = useMemo(() => getStakingApy(totalStakedBalance, weekCounter), [
		totalStakedBalance,
		weekCounter,
	]);

	const { writeAsync: getReward } = useContractWrite(getRewardConfig);

	return (
		<StakingTabContainer>
			<CardGridContainer>
				<CardGrid>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.claimable-rewards')}</div>
						<KwentaLabel>{truncateNumbers(claimableBalance, 4)}</KwentaLabel>
					</div>
					<div>
						<div className="title">{t('dashboard.stake.tabs.staking.annual-percentage-yield')}</div>
						<div className="value">{formatPercent(apy, { minDecimals: 2 })}</div>
					</div>
				</CardGrid>
				<Button
					fullWidth
					variant="flat"
					size="sm"
					disabled={!getReward || claimableBalance.eq(0)}
					onClick={async () => {
						const tx = await getReward?.();
						monitorTransaction({
							txHash: tx?.hash ?? '',
							onTxConfirmed: () => {
								resetStakingState();
								resetVesting();
								resetVestingClaimable();
							},
						});
					}}
				>
					{t('dashboard.stake.tabs.staking.claim')}
				</Button>
			</CardGridContainer>
			<StakeInputCard />
		</StakingTabContainer>
	);
};

const StakingTabContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: grid;
		grid-template-columns: 1fr 1fr;
		& > div {
			flex: 1;

			&:first-child {
				margin-right: 15px;
			}
		}
	`}

	${media.lessThan('mdUp')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`;

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const CardGrid = styled.div`
	display: grid;
	grid-template-rows: 1fr 1fr;

	& > div {
		margin-bottom: 20px;
	}

	.value {
		margin-top: 5px;
	}
`;

export default StakingTab;
