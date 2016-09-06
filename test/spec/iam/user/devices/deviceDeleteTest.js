describe('In IAM module', function() {
    describe('while testing devices', function() {
        var loginUser = corbelTest.common.clients.loginUser;
        var getTokenInfo = corbelTest.common.utils.getTokenInfo;
        var retry = corbelTest.common.utils.retry;

        var MAX_RETRY = 10;
        var RETRY_PERIOD = 1;

        var corbelDriver;
        var deviceId;

        beforeEach(function(done) {
            var user;
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1)
                .then(function(users) {
                    user = users[0];
                    return loginUser(corbelDriver, user.username, user.password);
                })
                .then(function() {
                    var deviceId= Date.now();
                    var device = {
                        notificationUri: Date.now(),
                        name: 'device',
                        type: 'Android',
                        notificationEnabled: true
                    };
                    return corbelDriver.iam.user()
                        .registerMyDevice(deviceId, device);
                })
                .then(function(deviceIdResponse) {
                    deviceId = deviceIdResponse;
                    return loginUser(corbelDriver, user.username, user.password, deviceId);
                })
                .should.notify(done);
        });

        afterEach(function(done) {
            corbelDriver.iam.user('me')
                .delete()
                .and.notify(done);
        });

        it('when a user deletes the device that he used in the login, the token is invalidated', function(done) {
            var tokenInfo = getTokenInfo(corbelDriver);
            expect(tokenInfo).to.have.deep.property('info.deviceId', deviceId);

            corbelDriver.iam.user()
                .deleteMyDevice(deviceId)
                .then(function() {
                    return retry(function() {
                        return corbelDriver.iam.user()
                            .get()
                            .then(function() {
                                var tokenInfo = getTokenInfo(corbelDriver);
                                expect(tokenInfo).to.not.have.deep.property('info.deviceId');
                            });
                    }, MAX_RETRY, RETRY_PERIOD);
                })

            .should.notify(done);
        });
    });
});
