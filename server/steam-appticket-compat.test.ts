import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

void test('steam-appticket generated protobuf works with the overridden runtime', () => {
  const require = createRequire(import.meta.url);
  const steamRequire = createRequire(require.resolve('steam-user'));
  const ticketRequire = createRequire(steamRequire.resolve('steam-appticket'));
  const { EncryptedAppTicket } = ticketRequire('./protobufs/generated/_load');
  // A wire-format fixture containing each field of EncryptedAppTicket.
  const wire = Buffer.from('080210ac02180320042a03010203', 'hex');
  const decoded = EncryptedAppTicket.decode(wire);
  assert.equal(decoded.ticket_version_no, 2);
  assert.equal(decoded.crc_encryptedticket, 300);
  assert.equal(decoded.cb_encrypteduserdata, 3);
  assert.equal(decoded.cb_encrypted_appownershipticket, 4);
  assert.deepEqual(Buffer.from(decoded.encrypted_ticket), Buffer.from([1, 2, 3]));
  assert.deepEqual(Buffer.from(EncryptedAppTicket.encode(decoded).finish()), wire);
  assert.throws(() => EncryptedAppTicket.decode(wire.subarray(0, -1)));
});
