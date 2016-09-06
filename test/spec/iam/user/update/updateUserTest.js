describe('In IAM module', function() {

    describe('while testing update user', function() {
        var corbelDriver;
        var user;

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        beforeEach(function(done) {

            corbelTest.common.iam.createUsers(corbelDriver, 1)
            .then(function(createdUsers) {
                user = createdUsers[0];
            })
            .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.iam.user(user.id)
            .delete()
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('user firstName is updated', function(done) {

            corbelDriver.iam.user(user.id)
            .update({
                'firstName': 'user Modified'
            })
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get();
            })
            .then(function(user) {
                expect(user).to.have.deep.property('data.firstName', 'user Modified');
            }).
            should.notify(done);
        });

        it('user username is updated', function(done) {
            var newUserName = 'NewUserName' + Date.now();

            corbelDriver.iam.user(user.id)
            .update({
                'username': newUserName
            })
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get();
            })
            .then(function(user) {
                expect(user).to.have.deep.property('data.username', newUserName);
            })
            .should.notify(done);
        });

        it('user email is updated', function(done) {
            var newEmail = 'newemail' + Date.now() + '@funkifake.com';

            corbelDriver.iam.user(user.id)
            .update({
                'email': newEmail
            })
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get();
            })
            .then(function(user) {
                expect(user).to.have.deep.property('data.email', newEmail);
            })
            .should.notify(done);
        });

        it('user scopes are updated', function(done) {

            corbelDriver.iam.user(user.id)
            .update({
                'scopes': ['iam:user:delete']
            })
            .then(function() {
                return corbelDriver.iam.user(user.id)
                .get();
            })
            .then(function(user) {
                expect(user).to.have.deep.property('data.scopes.length', 1);
                expect(user).to.have.deep.property('data.scopes').and.to.include('iam:user:delete');
            })
            .should.notify(done);
        });

        it('user is updated without new content', function(done) {

            corbelDriver.iam.user(user.id)
            .update()
            .should.notify(done);
        });
    });
});
