
let dashboardCache: any = null;

export const setDashboardCache = (data: any) => {
  dashboardCache = {
    data,
    timestamp: Date.now()
  };
};

export const getDashboardCache = () => {

  if (dashboardCache && Date.now() - dashboardCache.timestamp < 300000) {
    return dashboardCache.data;
  }
  return null;
};

export const clearDashboardCache = () => {
  dashboardCache = null;
};
