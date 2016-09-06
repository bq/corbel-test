describe('In IAM module', function() {

    describe('while testing signOut', function() {
        var corbelDriver;
        var corbelRootDriver;
        var user;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password);
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(user.id)
            .delete()
            .then(function() {
                return corbelRootDriver.iam.user(user.id)
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('the logged user is signed out using "me"', function(done) {
            corbelDriver.iam.user('me')
            .get()
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', user.id);

                return corbelDriver.iam.user('me')
                .signOut();
            })
            .then(function() {
                return corbelDriver.iam.user('me')
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'invalid_token');
            })
            .should.notify(done);
        });

        it('the logged user is signed out using disconnectMe', function(done) {
            corbelDriver.iam.user('me')
            .get()
            .then(function(response) {
                expect(response).to.have.deep.property('data.id', user.id);

                return corbelDriver.iam.user()
                .signOutMe();
            })
            .then(function() {
                return corbelDriver.iam.user('me')
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'invalid_token');
            })
            .should.notify(done);
        });
    });
});
