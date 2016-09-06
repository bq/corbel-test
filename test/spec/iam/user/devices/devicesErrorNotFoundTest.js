describe('In IAM module', function() {
    var corbelRootDriver;

    before(function() {
        corbelRootDriver = corbelTest.drivers['ROOT_CLIENT'].clone();
    });

    describe('while testing not found errors in devices', function() {
        var corbelDriver;
        var user;
        
        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['ROOT_CLIENT'].clone();

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

        it('fails with 404 not found when request retrieve a not existing device information', function(done) {
            corbelDriver.iam.user(user.id)
            .getDevice('notExistingId')
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('fails with 404 using user(me) when request retrieve a not existing device information', function(done) {
            corbelDriver.iam.user('me')
            .getDevice('notExistingId')
            .should.be.rejected
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });

        it('deleteMyDevice function can be used despite the device does not exist', function(done) {
            corbelDriver.iam.user()
            .deleteMyDevice('notExistingId')
            .then(function() {
                return corbelDriver.iam.user()
                .getMyDevices();
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });

        it('deleteDevice function can be used despite the device does not exist', function(done) {
            corbelDriver.iam.user('me')
            .deleteDevice('notExistingId')
            .then(function() {
                return corbelDriver.iam.user()
                .getMyDevices();
            })
            .then(function(devices) {
                expect(devices).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });
    });
});
