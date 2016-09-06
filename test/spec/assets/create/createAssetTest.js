describe('In ASSETS module', function() {
    describe('when creating assets with an admin user', function() {
        var corbelDriver;
        var createdAssetsIds;
        var promises;
        var getAsset = corbelTest.common.assets.getAsset;

        beforeEach(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            createdAssetsIds = [];
        });

        afterEach(function(done) {
            var promises = createdAssetsIds.map(function(assetId) {
                return corbelDriver.assets.asset(assetId).delete();
            });
            return Promise.all(promises)
                .should.notify(done);
        });

        it('asset gets created', function(done) {
            var asset = getAsset();

            corbelDriver.assets.asset().create(asset)
                .then(function(id) {
                    asset.id = id;
                    createdAssetsIds.push(id);

                    return corbelDriver.assets.asset(id).get();
                }).then(function(response) {
                    expect(response).to.have.deep.property('data.id', asset.id);
                    expect(response).to.have.deep.property('data.productId', asset.productId);
                    expect(response).to.have.deep.property('data.userId', asset.userId);
                    expect(response).to.have.deep.property('data.scopes').and.to.eql(asset.scopes);
                    expect(response).to.have.deep.property('data.name', asset.name);
                    expect(response).to.have.deep.property('data.expire', asset.expire);
                    expect(response).to.have.deep.property('data.active', asset.active);
                })
                .should.notify(done);
        });

        it('permanent asset gets created', function(done) {
            var asset = getAsset();
            asset.expire = null;

            corbelDriver.assets.asset().create(asset)
                .then(function(id) {
                    asset.id = id;
                    createdAssetsIds.push(id);

                    return corbelDriver.assets.asset(id).get();
                }).then(function(response) {
                    expect(response).to.have.deep.property('data.id', asset.id);
                })
                .should.notify(done);
        });

        it('two assets with the same user, product and name, ' +
            'contains submitted data and has identical id',
            function(done) {
                var asset1 = getAsset();
                var asset2 = {
                  name : asset1.name,
                  productId: asset1.productId,
                  expire: asset1.expire+100,
                  active: false,
                  scopes: asset1.scopes,
                  userId: asset1.userId
                };

                corbelDriver.assets.asset().create(asset1)
                    .then(function(id) {
                        asset1.id = id;
                        createdAssetsIds.push(id);

                        return corbelDriver.assets.asset(id).get();
                    }).then(function(response) {
                        expect(response).to.have.deep.property('data.name', asset1.name);
                        expect(response).to.have.deep.property('data.productId', asset1.productId);
                        expect(response).to.have.deep.property('data.expire', asset1.expire);
                        expect(response).to.have.deep.property('data.active', asset1.active);
                        expect(response).to.have.deep.property('data.scopes')
                            .that.is.deep.equals(asset1.scopes);

                        return corbelDriver.assets.asset().create(asset2);
                    })
                    .then(function(id) {
                        asset2.id = id;
                        createdAssetsIds.push(id);

                        return corbelDriver.assets.asset(id).get();
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.id', asset1.id);
                        expect(response).to.have.deep.property('data.name', asset1.name);
                        expect(response).to.have.deep.property('data.productId', asset1.productId);
                        expect(response).to.have.deep.property('data.expire', asset2.expire);
                        expect(response).to.have.deep.property('data.active', asset2.active);
                    })
                    .should.notify(done);
            });

        it('two assets with the same user, product and different name, ' +
            'contains submitted data and has different id',
            function(done) {
                var asset1 = getAsset();
                var asset2 = getAsset();
                asset2.name = 'createAssetTest2';

                corbelDriver.assets.asset().create(asset1)
                    .then(function(id) {
                        asset1.id = id;
                        createdAssetsIds.push(id);

                        return corbelDriver.assets.asset(id).get();
                    }).then(function(response) {
                        expect(response).to.have.deep.property('data.id', asset1.id);

                        return corbelDriver.assets.asset().create(asset2);
                    })
                    .then(function(id) {
                        asset2.id = id;
                        createdAssetsIds.push(id);

                        return corbelDriver.assets.asset(id).get();
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.id').that.is.not.equals(asset1.id);
                    })
                    .should.notify(done);
            });

        it('two assets with the same name, product and different user, ' +
            'contains submitted data and has different id',
            function(done) {
                var asset1 = getAsset();
                var asset2 = getAsset();
                asset2.userId = 'otherUser';

                corbelDriver.assets.asset().create(asset1)
                    .then(function(id) {
                        asset1.id = id;
                        createdAssetsIds.push(id);

                        return corbelDriver.assets.asset(id).get();
                    }).then(function(response) {
                        expect(response).to.have.deep.property('data.id', asset1.id);

                        return corbelDriver.assets.asset().create(asset2);
                    })
                    .then(function(id) {
                        asset2.id = id;
                        createdAssetsIds.push(id);

                        return corbelDriver.assets.asset(id).get();
                    })
                    .then(function(response) {
                        expect(response).to.have.deep.property('data.id').that.is.not.equals(asset1.id);
                    })
                    .should.notify(done);
            });

    });
});
