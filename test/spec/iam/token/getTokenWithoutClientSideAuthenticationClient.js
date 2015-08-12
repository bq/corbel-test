/*jshint multistr: true */
describe('In IAM module', function() {
  describe('get a token with/out client side authentication', function() {

    var corbelDriver;
    var aud = _.cloneDeep(corbelTest.CONFIG['aud']);
    var testPrn = _.cloneDeep(corbelTest.CONFIG['testPrn']);
    var clientSecret = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']).clientSecret;
    var claimDefault = _.cloneDeep(corbelTest.CONFIG['DEFAULT_CLIENT']);
    var jwtAlgorithm = _.cloneDeep(corbelTest.CONFIG['jwtAlgorithm']);
    var clientIdrequestDomainClient = _.cloneDeep(corbelTest.CONFIG['clientIdrequestDomainClient']);
    var version = _.cloneDeep(corbelTest.CONFIG['VERSION']);
    var claimExp = _.cloneDeep(corbelTest.CONFIG['claimExp']);

    before(function() {
      corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'];
    });

    describe('if try to get a token with client side authentication with not allowed client', function() {
      it('fails returning error UNAUTHORIZED(401', function(done) {
        var claims = {
          iss: clientIdrequestDomainClient,
          prn: testPrn,
          aud: aud,
          scope: claimDefault.scopes,
          version: version
        };
        claims.exp = Math.round((new Date().getTime() / 1000)) + claimExp;
        corbelDriver.iam.token().create({
          jwt: corbel.jwt.generate(
            claims,
            clientSecret,
            jwtAlgorithm
          )
        }).should.eventually.be.rejected.
        then(function(e) {
          // After solve the bug there will be unnecesary parse 'e'
          var error = JSON.parse(e.data.responseText);
          expect(e.data.status).to.be.equal(401);
          expect(error.error).to.be.equal('unauthorized');
        }).
        should.notify(done);
      });
    });

    describe('if try to get a token without prn and \
      with client side authentication with not allowed client ', function() {
        it('successes returning an access token', function(done) {
          var claims = {
            iss: claimDefault.clientId,
            aud: aud,
            scope: claimDefault.scopes,
            version: version
          };

          corbelDriver.iam.token().create({
            jwt: corbel.jwt.generate(
              claims,
              claimDefault.clientSecret,
              jwtAlgorithm
            )
          }).should.eventually.be.fulfilled.notify(done);
        });
      });
  });
});
