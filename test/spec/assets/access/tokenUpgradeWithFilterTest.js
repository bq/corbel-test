describe('In ASSETS module', function() {
    describe('with a new user with an asset with filter', function() {
        var getAsset = corbelTest.common.assets.getAsset;
        var loginAsRandomUser = corbelTest.common.clients.loginAsRandomUser;

        var asset;
        var user;
        var adminCorbelDriver;
        var corbelDriver;

        beforeEach(function(done) {
            adminCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            loginAsRandomUser(corbelDriver)
                .then(function(response) {
                    user = response.user;
                })
                .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.iam.user('me').delete()
                .should.notify(done);
        });

        describe('fails access when', function() {
            var asset;
            beforeEach(function() {
                asset = getAsset();
                asset.userId = user.id;
            });

            it('the filter is not satisfied because the value of the property is not the expected', function(done) {
                asset.properties = {
                    'testProperty': 'KO'
                };
                asset.filters = ['test-asset-filter'];

                adminCorbelDriver.assets.asset().create(asset)
                    .then(function() {
                        return corbelDriver.assets.asset().access();
                    })
                    .then(function() {
                        return corbelDriver.resources.collection('assets:test').get().
                        should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 401);
                        expect(e).to.have.deep.property('data.error', 'unauthorized_token');
                    })
                    .should.notify(done);
            });

            it('the filter is not satisfied because the no property set in the asset', function(done) {
                asset.properties = undefined;
                asset.filters = ['test-asset-filter'];

                adminCorbelDriver.assets.asset().create(asset)
                    .then(function() {
                        return corbelDriver.assets.asset().access();
                    })
                    .then(function() {
                        return corbelDriver.resources.collection('assets:test').get().
                        should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 401);
                        expect(e).to.have.deep.property('data.error', 'unauthorized_token');
                    })
                    .should.notify(done);
            });
        });


        describe('fulfilled access when', function() {
            var asset;
            beforeEach(function() {
                asset = getAsset();
                asset.userId = user.id;
            });

            it('the filter is satisfied', function(done) {
                asset.properties = {
                    'testProperty': 'OK'
                };
                asset.filters = ['test-asset-filter'];

                adminCorbelDriver.assets.asset().create(asset)
                    .then(function() {
                        return corbelDriver.assets.asset().access();
                    })
                    .then(function() {
                        return corbelDriver.resources.collection('assets:test').get();
                    })
                    .should.notify(done);
            });

            it('the filter is satisfied although another asset fails with nonexistent filter', function(done) {
                asset.properties = {
                    'testProperty': 'OK'
                };
                asset.filters = ['test-asset-filter'];

                adminCorbelDriver.assets.asset().create(asset)
                    .then(function() {
                        var assetFail = getAsset();
                        assetFail.filters = ['not-existing-filter'];
                        assetFail.userId = user.id;
                        return adminCorbelDriver.assets.asset().create(assetFail);
                    })
                    .then(function() {
                        return corbelDriver.assets.asset().access();
                    })
                    .then(function() {
                        return corbelDriver.resources.collection('assets:test').get();
                    })
                    .then(function() {
                        return corbelDriver.assets.asset().get();
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.length', 2);
                        response.data.should.all.have.property('filterResults');

                        response.data.forEach(function(asset){
                            if(asset.properties.testProperty) {
                                expect(asset).to.have.deep.property('filterResults.test-asset-filter', true);
                            } else {
                                expect(asset).to.have.deep.property('filterResults.not-existing-filter', false);

                            }
                        });
                    })
                    .should.notify(done);
            });

        });

    });
});
