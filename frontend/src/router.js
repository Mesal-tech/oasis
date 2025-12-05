import Navigo from 'navigo';

const router = new Navigo('/');

router.hooks({
  before(done, match) {
    // Global before hook (auth, loading, etc.)
    console.log('Navigating to:', match.url);
    done();
  },
  after(match) {
    // Global after hook (analytics, cleanup, etc.)
    console.log('Navigated to:', match.url);
  }
});

export { router };