describe('In IAM module', function() {

    describe('while testing updateMe', function() {
        var corbelDriver;
        var corbelRootDriver;
        var user;

        before(function(){
            corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .should.be.fulfilled
            .then(function(createdUsers) {
                user = createdUsers[0];

                return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password)
                .should.be.fulfilled;
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelRootDriver.iam.user(user.id)
            .delete()
            .should.be.fulfilled
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

        it('an error [401] is returned while trying to use updateMe with no logged user', function(done) {

            corbelDriver.iam.user('me')
            .signOut()
            .should.be.fulfilled
            .then(function(){
                return corbelDriver.iam.user()
                .updateMe({
                    'firstName': 'user Modified Me'
                })
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 401);
                expect(e).to.have.deep.property('data.error', 'invalid_token');
            })
            .should.notify(done);
        });

        it('an error [401] is returned while trying to use user("me").update with no logged user', function(done) {

            corbelDriver.iam.user('me')
            .signOut()
            .should.be.fulfilled
            .then(function(){
                return corbelDriver.iam.user('me')
                .update({
                    'firstName': 'user Modified Me'
                })
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
