import React from 'react';
import { Alert } from 'react-native';
import {
  CREDIT_DISCOUNT_VALUE,
  CREDIT_EARN_THRESHOLD,
  CREDIT_EARN_VALUE,
  DEFAULT_CREDIT_POINTS,
  MIN_CREDIT_POINTS_TO_REDEEM,
} from '../constants/cart';
import { peso, pesoWithCents } from '../utils/currency';

export function useCartCredits({ subtotal, hasItems, creditPointsParam }) {
  const [redeemCredits, setRedeemCredits] = React.useState(false);

  const availableCreditPoints = React.useMemo(() => {
    if (typeof creditPointsParam === 'number' && Number.isFinite(creditPointsParam)) {
      return creditPointsParam;
    }
    if (typeof creditPointsParam === 'string' && creditPointsParam.trim().length) {
      const parsed = Number(creditPointsParam);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return DEFAULT_CREDIT_POINTS;
  }, [creditPointsParam]);

  const creditEligibleMultiplier = hasItems ? Math.floor(subtotal / CREDIT_EARN_THRESHOLD) : 0;
  const creditEligibleByTotal = creditEligibleMultiplier > 0;
  const hasEnoughCredits = availableCreditPoints >= MIN_CREDIT_POINTS_TO_REDEEM;
  const canRedeemCredits = creditEligibleByTotal && hasEnoughCredits;
  const creditDiscount = redeemCredits && canRedeemCredits ? CREDIT_DISCOUNT_VALUE : 0;
  const creditEarnedThisOrder = creditEligibleMultiplier * CREDIT_EARN_VALUE;
  const remainingCreditPoints = redeemCredits
    ? Math.max(0, availableCreditPoints - MIN_CREDIT_POINTS_TO_REDEEM)
    : availableCreditPoints;

  const creditSummaryText = React.useMemo(() => {
    if (!hasItems) {
      return 'Add items to apply credit points.';
    }
    if (!creditEligibleByTotal) {
      return `Orders must reach ${peso(
        CREDIT_EARN_THRESHOLD
      )} to redeem credit points and earn new ones.`;
    }
    if (!hasEnoughCredits) {
      return `Need ${MIN_CREDIT_POINTS_TO_REDEEM.toFixed(
        2
      )} pts. You currently have ${availableCreditPoints.toFixed(2)} pts.`;
    }
    if (redeemCredits) {
      return `${remainingCreditPoints.toFixed(2)} pts will remain after checkout. Earn ${creditEarnedThisOrder.toFixed(
        2
      )} pts after this order.`;
    }
    return `${availableCreditPoints.toFixed(2)} pts available. Redeem ${MIN_CREDIT_POINTS_TO_REDEEM.toFixed(
      2
    )} pts for ${pesoWithCents(CREDIT_DISCOUNT_VALUE)} off and earn ${creditEarnedThisOrder.toFixed(
      2
    )} pts after checkout.`;
  }, [
    hasItems,
    creditEligibleByTotal,
    availableCreditPoints,
    hasEnoughCredits,
    redeemCredits,
    remainingCreditPoints,
    creditEarnedThisOrder,
  ]);

  React.useEffect(() => {
    if (!canRedeemCredits) {
      setRedeemCredits(false);
    }
  }, [canRedeemCredits]);

  const handleToggleCredits = React.useCallback(() => {
    if (!hasItems) {
      return;
    }
    if (!creditEligibleByTotal) {
      Alert.alert(
        'Order total too low',
        `Add a little more - orders must reach ${peso(
          CREDIT_EARN_THRESHOLD
        )} before you can use or earn credit points.`
      );
      return;
    }
    if (!hasEnoughCredits) {
      Alert.alert(
        'Not enough credit points',
        `You need at least ${MIN_CREDIT_POINTS_TO_REDEEM.toFixed(2)} pts to redeem ${pesoWithCents(
          CREDIT_DISCOUNT_VALUE
        )} off.`
      );
      return;
    }
    setRedeemCredits((prev) => !prev);
  }, [hasItems, creditEligibleByTotal, hasEnoughCredits]);

  const total = React.useMemo(
    () => Math.max(subtotal - creditDiscount, 0),
    [subtotal, creditDiscount]
  );

  return {
    availableCreditPoints,
    redeemCredits,
    canRedeemCredits,
    creditDiscount,
    creditEarnedThisOrder,
    remainingCreditPoints,
    creditSummaryText,
    handleToggleCredits,
    total,
    creditApplied: creditDiscount,
  };
}
