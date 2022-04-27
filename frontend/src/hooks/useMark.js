import Mark from 'mark.js';

/**
 * use mark.js hook
 * @param  {string} [on='.card-header, .card-body'] - query selector for document elements to mark
 */
function useMark ({
  on = '.card-header, .card-body'
} = {}) {
  const selector = on;
  /**
   * marks instances of term within selector
   * @param  {string} term - term instance to mark
   */
  function markInstances (term = '') {
    if (typeof window === 'undefined') return;
    if (typeof document === 'undefined') return;
    if (!selector) return;

    // highlight all the instances
    window.markInstance = new Mark(document.querySelectorAll(selector));
    window.markInstance.unmark({
      done: () => {
        window.markInstance.mark(term);
      }
    });
  }

  return { markInstances };
}

export default useMark;
