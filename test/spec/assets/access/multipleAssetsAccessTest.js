describe('In ASSETS module', function() {
    describe('when an admin creates multiple assets', function(){
        var loginAsRandomUser = corbelTest.common.clients.loginAsRandomUser;

        var adminCorbelDriver;
        var corbelDriver;
        var user;
        var createdAssetsIds;

        beforeEach(function(done){
          adminCorbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
          corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

          loginAsRandomUser(corbelDriver)
              .should.be.fulfilled
              .then(function(response) {
                  user = response.user;
              })
            .should.notify(done);
        });

        afterEach(function(done){
            var promises = createdAssetsIds.map(function(assetId) {
                 return adminCorbelDriver.assets.asset(assetId).delete()
                .should.be.fulfilled;
            });

            Promise.all(promises)
            .should.be.fulfilled
            .then(function() {
                return corbelDriver.iam.user('me').delete()
                .should.be.fulfilled;
            })
            .should.notify(done);
        });

        [30, 50, 60, 200].forEach(function(amount){
            it('token gets upgraded when '+amount+' assets are assigned to an user', function(done) {
                corbelTest.common.assets.createMultipleAssets(adminCorbelDriver, amount, user.id)
                .should.be.fulfilled
                .then(function(response) {
                    createdAssetsIds = response;
                    return corbelDriver.assets.asset().access()
                    .should.be.fulfilled;
                })
                .should.notify(done);
            });
        });

    });
});
