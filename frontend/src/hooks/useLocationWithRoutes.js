function useLocationWithRoutes ({
  routePath = '/',
  origin = ''
} = {}) {
  function getOrigin () {
    return origin || window?.location?.origin;
  }

  function getFullLocationFromPath (path = routePath) {
    const baseURL = getOrigin();
    const newURL = new URL(path, baseURL);
    return newURL.toString();
  }

  return {
    getFullLocationFromPath,
    getOrigin
  };
}

export default useLocationWithRoutes;
