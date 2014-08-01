describe('L.Editable', function() {

    before(function () {
        this.map = map;
    });
    after(function () {
    });

    describe('#init', function() {

        it('should be initialized', function() {
            assert.ok(this.map.editTools);
        });

    });

});
