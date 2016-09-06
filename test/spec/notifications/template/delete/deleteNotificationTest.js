describe('In NOTIFICATIONS module', function() {

    describe('when testing deletion', function() {
        var corbelDriver;
        var nameData;

        before(function(done) {
            corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
        
            nameData = 'notificationName-' + Date.now();
            corbelTest.common.notifications.createNotification(corbelDriver, nameData)
            .should.notify(done);
        });

        after(function(done) {
            corbelDriver.notifications.template(nameData)
                .get()
            .should.be.rejected
            .should.notify(done);
        });

        it('a notification template can be deleted', function(done) {
            corbelDriver.notifications.template(nameData)
                .delete()
            .should.notify(done);
        });
    });
});
