describe('In ASSETS module', function() {
    describe('when creating a permanent asset', function() {
        var loginAsRandomUser = corbelTest.common.clients.loginAsRandomUser;

        var asset;
        var user;
        var clientCorbelDriver;
        var adminCorbelDriver;

        beforeEach(function(done) {
            clientCorbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            adminCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            loginAsRandomUser(clientCorbelDriver)
                .then(function(response) {
                    user = response.user;
                })
                .should.notify(done);
        });

        after(function(done) {
            adminCorbelDriver.assets.asset(asset.id).delete()
                .then(function() {
                    return adminCorbelDriver.assets.asset(asset.id).get()
                        .should.be.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 404);
                    expect(e).to.have.deep.property('data.error', 'not_found');

                    return clientCorbelDriver.iam.user('me').delete();
                })
                .should.notify(done);
        });

        it('asset is created and assigned correctly', function(done) {
            asset = corbelTest.common.assets.getAsset();
            asset.expire = null;
            asset.userId = user.id;

            adminCorbelDriver.assets.asset().create(asset)
                .then(function(id) {
                    asset.id = id;
                    return clientCorbelDriver.assets.asset().get();
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);

                    return clientCorbelDriver.resources.collection('assets:test').get()
                        .should.be.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized_token');
                    return clientCorbelDriver.assets.asset().access();
                })
                .then(function() {
                    return clientCorbelDriver.resources.collection('assets:test').get();
                })
                .should.notify(done);
        });
        
        it('asset is created and assigned correctly and asset access call is idempotent', function(done) {
            asset = corbelTest.common.assets.getAsset();
            asset.expire = null;
            asset.userId = user.id;

            adminCorbelDriver.assets.asset().create(asset)
                .then(function(id) {
                    asset.id = id;
                    return clientCorbelDriver.assets.asset().get();
                })
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);

                    return clientCorbelDriver.resources.collection('assets:test').get()
                        .should.be.rejected;
                })
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized_token');
                    return clientCorbelDriver.assets.asset().access();
                })
                .then(function() {
                    return clientCorbelDriver.resources.collection('assets:test').get();
                })
               .then(function(e) {
                    return clientCorbelDriver.assets.asset().access();
                })
                .then(function() {
                    return clientCorbelDriver.resources.collection('assets:test').get();
                })                
                .should.notify(done);
        });
    });
});
