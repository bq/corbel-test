describe('In WEBFS module', function() {
    var corbelDriver;

    beforeEach(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
    });

    it('a resource can be retrieved with the same content-type as specified through webfs', function(done) {
        corbelDriver.webfs.webfs('index.html').get({
                Accept: 'text/html'
            })
            .then(function(response) {
                expect(response).to.have.deep.property('headers.content-type').and.to.contain('text/html');
            })
            .should.notify(done);
    });

    it('a resource can be retrieved using the cookie', function(done) {
        corbelTest.common.utils.replaceUriForProxyUse(corbelDriver);
        corbelDriver.iam.token().create({
                    claims: {
                        'basic_auth.username': corbelDriver.config.get('username'),
                        'basic_auth.password': corbelDriver.config.get('password')
                    }
                },
                true)
            .then(function() {
                return corbel.request.send({
                        url: corbelDriver.config.getCurrentEndpoint('webfs') + 'silkroad-qa/path/index.html',
                        withCredentials: true
                    });
            }).should.notify(done);
    });

    it('an error 404 is returned if the resorce does not exist in webfs', function(done) {
        corbelDriver.webfs.webfs('non existent').get()
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
    });
});
