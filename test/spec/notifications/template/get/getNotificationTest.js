describe('In NOTIFICATIONS module', function() {

    describe('while getting notification templates', function() {
        var corbelDriver;
        var notificationList;

        before(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();

            corbelTest.common.iam.createUsers(corbelDriver, 1);
            corbelTest.common.notifications.createMultipleNotifications(corbelDriver, 24)
            .then(function(createdList) {
                notificationList = createdList;
            })
            .should.notify(done);
        });

        after(function(done) {
            corbelTest.common.notifications.deleteNotificationsList(corbelDriver, notificationList)
            .notify(done);
        });

        it('if there are not params, default number of notification templates are received', function(done) {
            corbelDriver.notifications.template()
                .get()
            .then(function(response){
                expect(response).to.have.deep.property('data.length', corbelTest.CONFIG.GLOBALS.defaultPageSize);
            })
            .should.notify(done);
        });

        it('if a page with size 5 is requested, five notification templates are received', function(done) {
            var params = {
                pagination: {
                    pageSize: 5
                }
            };

            corbelDriver.notifications.template()
                .get(params)
            .then(function(response){
                expect(response).to.have.deep.property('data.length', 5);
            })
            .should.notify(done);
        });

        it('if page 1 with default pageSize is requested, ten notification templates are received', function(done) {
            var params = {
                pagination: {
                    page: 1,
                    pageSize: corbelTest.CONFIG.GLOBALS.defaultPageSize
                }
            };

            corbelDriver.notifications.template()
                .get(params)
            .then(function(response){
                expect(response).to.have.deep.property('data.length', corbelTest.CONFIG.GLOBALS.defaultPageSize);
            })
            .should.notify(done);
        });

        it('no notification templates are received if the query is not matched', function(done) {
            var params = {
                query: [{
                    '$eq': {
                        id: 'nonexistent'
                    }
                }]
            };

            corbelDriver.notifications.template()
                .get(params)
            .then(function(response){
                expect(response).to.have.deep.property('data.length', 0);
            })
            .should.notify(done);
        });
    });
});
