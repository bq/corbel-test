describe('In IAM module', function() {

    describe('while testing devices', function() {
        var TOTAL_DEVICE_AMOUNT = 10;
        var user;
        var corbelDriver;
        var random;
        var retriveDevices;

        beforeEach(function(done) {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
            corbelTest.common.iam.createUsers(corbelDriver, 1)
                .then(function(createdUsers) {
                    user = createdUsers[0];
                    return corbelTest.common.clients.loginUser(corbelDriver, user.username, user.password);
                })
                .then(function() {
                    return corbelTest.common.iam.createDevices(corbelDriver, TOTAL_DEVICE_AMOUNT);
                })
                .then(function() {
                    return corbelDriver.iam.user()
                        .getMyDevices();
                })
                .then(function(devices) {
                    expect(devices).to.have.deep.property('data.length', TOTAL_DEVICE_AMOUNT);
                    retriveDevices = devices.data;
                })
                .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.iam.user()
                .deleteMe()
                .should.be.notify(done);
        });

        it('can get a page ordered', function(done) {
            var params = {
                sort: {
                    firstConnection: 'asc'
                },
                pagination: {
                    page: 0,
                    pageSize: 3
                }
            };

            corbelDriver.iam.user()
                .getMyDevices(params)
                .then(function(devices) {
                    expect(devices).to.have.deep.property('data.length', 3);
                    devices.data.reduce(function(deviceA, deviceB) {
                      expect(deviceA.firstConnection).to.be.at.most(deviceB.firstConnection);
                      return deviceB;
                    });
                })
                .should.notify(done);
        });

        it('can query with not equals', function(done) {
            var params = {
              query: [{
                  '$ne': {
                      type: retriveDevices[0].type
                  }
              }]
            };

            corbelDriver.iam.user()
                .getMyDevices(params)
                .then(function(devices) {
                    expect(devices).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
        });

    });
});
