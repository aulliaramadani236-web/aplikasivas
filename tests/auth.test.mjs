import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {register,login,logout,currentUser,legacyBusinessFor} from '../auth.js';
class Storage {
  data=new Map();
  getItem(key){return this.data.get(key)??null;}
  setItem(key,value){this.data.set(key,String(value));}
  removeItem(key){this.data.delete(key);}
}
beforeEach(()=>{globalThis.localStorage=new Storage();globalThis.sessionStorage=new Storage();});
const details={name:'Pemilik Uji',businessName:'Toko Uji',email:'pemilik@example.com',password:'kata-sandi-uji-123',confirmation:'kata-sandi-uji-123'};
test('daftar, logout, dan login email tanpa membedakan huruf besar',async()=>{
  const user=await register(details);assert.equal(currentUser().id,user.id);logout();assert.equal(currentUser(),null);
  const again=await login({email:' PEMILIK@EXAMPLE.COM ',password:details.password});assert.equal(again.id,user.id);assert.equal(again.businessName,'Toko Uji');
});
test('email duplikat dan kata sandi salah ditolak',async()=>{
  await register(details);logout();await assert.rejects(register({...details,email:'PEMILIK@example.com'}),/sudah terdaftar/);
  await assert.rejects(login({email:details.email,password:'salah-123456'}),/tidak sesuai/);assert.equal(currentUser(),null);
  await assert.rejects(login({email:'asing@example.com',password:details.password}),/tidak sesuai/);
});
test('validasi pendaftaran tidak menyimpan akun yang tidak valid',async()=>{
  await assert.rejects(register({...details,password:'pendek',confirmation:'pendek'}),/10–128/);
  await assert.rejects(register({...details,confirmation:'beda'}),/belum sama/);
  await assert.rejects(register({...details,email:'bukan-email'}),/email yang valid/);
  assert.equal(localStorage.getItem('vas-accounts-v1'),null);
});
test('kata sandi tidak disimpan mentah dan salt berbeda antar akun',async()=>{
  await register(details);await register({...details,email:'lain@example.com'});
  const accounts=JSON.parse(localStorage.getItem('vas-accounts-v1'));assert.notEqual(accounts[0].salt,accounts[1].salt);assert.notEqual(accounts[0].hash,accounts[1].hash);
  assert.ok(!localStorage.getItem('vas-accounts-v1').includes(details.password));assert.ok(!sessionStorage.getItem('vas-auth-session-v1').includes(details.password));assert.equal(accounts[0].iterations,600000);
});
test('sesi kedaluwarsa dan akun yang dihapus tidak diterima',async()=>{
  const user=await register(details);sessionStorage.setItem('vas-auth-session-v1',JSON.stringify({userId:user.id,expiresAt:Date.now()-1}));assert.equal(currentUser(),null);
  await login(details);localStorage.setItem('vas-accounts-v1','[]');assert.equal(currentUser(),null);
});
test('data lama hanya ditawarkan kepada akun lokal pertama dan satu kali',async()=>{
  const old={business:{name:'Toko Lama'},products:[],customers:[],sales:[],orders:[],expenses:[],movements:[],capital:[],audit:[]};localStorage.setItem('vas-v1-live',JSON.stringify(old));
  const first=await register(details),second=await register({...details,email:'kedua@example.com'});assert.equal(legacyBusinessFor(first.id).business.name,'Toko Lama');assert.equal(legacyBusinessFor(second.id),null);localStorage.setItem('vas-legacy-owner',first.id);assert.equal(legacyBusinessFor(first.id),null);
});
