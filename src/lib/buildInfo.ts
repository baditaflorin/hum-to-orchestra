export interface BuildInfo {
  version: string;
  buildCommit: string;
  repositoryUrl: string;
  paypalUrl: string;
}

export const buildInfo: BuildInfo = {
  version: __APP_VERSION__,
  buildCommit: __GIT_COMMIT__,
  repositoryUrl: __REPOSITORY_URL__,
  paypalUrl: __PAYPAL_URL__
};
