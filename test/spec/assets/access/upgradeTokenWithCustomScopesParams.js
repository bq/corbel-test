describe('In ASSETS module', function() {
    describe('when creating assets with an admin user', function() {
        var getAsset = corbelTest.common.assets.getAsset;
        var loginAsRandomUser = corbelTest.common.clients.loginAsRandomUser;

        var user;
        var clientCorbelDriver;
        var adminCorbelDriver;

        describe('when setting correct custom parameters', function() {

            before(function(done) {
                adminCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
                clientCorbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

                loginAsRandomUser(clientCorbelDriver)
                    .then(function(response) {
                        user = response.user;
                        var asset = getAsset(['custom:test;type=Custom;customId=2']);
                        asset.userId = user.id;
                        return adminCorbelDriver.assets.asset().create(asset);
                    })
                    .then(function() {
                        var asset = getAsset(['custom:test;type=Custom;customId=3']);
                        asset.userId = user.id;
                        return adminCorbelDriver.assets.asset().create(asset);
                    })
                    .should.notify(done);
            });

            after(function(done) {
                clientCorbelDriver.iam.user('me').delete()
                    .should.notify(done);
            });

            it('token upgrade works correctly', function(done) {
                var sessionToken = clientCorbelDriver.config.config.iamToken.accessToken;
                var session;

                clientCorbelDriver.assets.asset().get()
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 2);
                        return clientCorbelDriver.iam.user().getMySession();
                    })
                    .then(function(response) {
                        session = response.data;
                        expect(response).to.have.deep.property('data.token', sessionToken);
                        expect(response).to.have.deep.property('data.scopes')
                        .and.not.to.include.members(['custom:test']);
                        return clientCorbelDriver.assets.asset().access();
                    })
                    .then(function(response) {
                        return clientCorbelDriver.iam.user().getMySession();
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.token', sessionToken);
                        expect(response).to.have.deep.property('data.scopes')
                        .and.to.include.members(session.scopes);
                        expect(response).to.have.deep.property('data.scopes')
                        .and.to.include.members(['custom:test']);
                    })
                    .should.notify(done);
            });
        });
    });
});
