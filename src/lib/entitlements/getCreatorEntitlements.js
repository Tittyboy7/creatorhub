import {
  DEFAULT_CREATORS_HUB_PLAN,
  getPlatformSyncEntitlement,
} from "./platformSyncEntitlements";

export default function getCreatorEntitlements({
  planKey =
    DEFAULT_CREATORS_HUB_PLAN,
} = {}) {
  return {
    planKey,

    platformSync:
      getPlatformSyncEntitlement(
        planKey
      ),
  };
}