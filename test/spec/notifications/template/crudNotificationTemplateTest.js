describe('In NOTIFICATIONS module', function() {

    describe('when testing crud operations for templates', function() {
        var corbelDriver;
        var nameData = 'mail_notification_' + Date.now();

        var notificationData = {
            id: nameData,
            type: 'mail',
            sender: 'me',
            text: 'text',
            title: 'subject'
        };

        before(function() {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        });

        it('a notification template can be created, updated and deleted', function(done) {
            corbelDriver.notifications.template()
                .create(notificationData)
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get();
            })
            .then(function(response) {
                expect(response).to.have.property('data').and.to.contain(notificationData);

                return corbelDriver.notifications.template(nameData)
                    .update({type: 'sms'});
            })
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get();
            })
            .then(function(response) {
                expect(response).to.have.deep.property('data.type', 'sms');

                return corbelDriver.notifications.template(nameData)
                    .delete();
            })
            .then(function() {
                return corbelDriver.notifications.template(nameData)
                    .get()
                .should.be.rejected;
            })
            .then(function(e) {
                expect(e).to.have.property('status', 404);
                expect(e).to.have.deep.property('data.error', 'not_found');
            })
            .should.notify(done);
        });
    });
});
