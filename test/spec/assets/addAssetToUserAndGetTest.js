describe('In ASSETS module,', function() {
    describe('when add new asset to a user,', function() {
        var loginAsRandomUser = corbelTest.common.clients.loginAsRandomUser;
        var adminCorbelDriver;
        var corbelDriver;
        var assetId;
        var asset;

        before(function(done) {
            adminCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            loginAsRandomUser(corbelDriver)
                .should.be.fulfilled
                .then(function(data) {
                    asset = {
                        userId: data.user.id,
                        name: 'asset',
                        productId: String(Date.now()),
                        expire: corbelTest.common.assets.getExpire(),
                        active: true,
                        scopes: ['assets:asset']
                    };
                    return adminCorbelDriver.assets.asset().create(asset)
                        .should.be.fulfilled;
                })
                .then(function(id) {
                    assetId = id;
                })
                .should.notify(done);
        });

        after(function(done) {
            adminCorbelDriver.assets.asset(assetId).delete()
                .should.be.fulfilled
                .then(function() {
                    return corbelDriver.iam.user('me').delete()
                        .should.be.fulfilled;
                })
                .should.notify(done);
        });


        it('he can get it', function(done) {
            corbelDriver.assets.asset().get()
                .should.be.fulfilled
                .then(function(assets) {
                    expect(assets).to.have.deep.property('data.length', 1);
                    expect(assets).to.have.deep.property('data[0].name', asset.name);
                    expect(assets).to.have.deep.property('data[0].productId', asset.productId);
                })
                .should.notify(done);
        });

    });
});
