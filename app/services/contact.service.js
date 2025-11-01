const { ObjectId, ReturnDocument } = require("mongodb");

class ContactService {
  constructor(client) {
    this.contact = client.db().collection("contacts");
  }

  //Định nghĩa các phương thức truy xuất CSDL sử dụng mongdbdb API
  extractContactData(payload) {
    const contact = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
      phone: payload.phone,
      favorite: payload.favorite,
    };
    //REmove undefined fields
    Object.keys(contact).forEach(
      (key) => contact[key] === undefined && delete contact[key]
    );
    return contact;
  }
  async create(payload) {
    const contact = this.extractContactData(payload);
    const result = await this.contact.findOneAndUpdate(
      contact,
      { $set: { favorite: contact.favorite == true } },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.contact.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(new RegExp(name)), $options: "i" }, // bieu thuc chinh quy khong phan biet hoa thuong
    });
  }

  async findById(id) {
    return await this.contact.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : id };
    const updateContact = this.extractContactData(payload);
    if (Object.keys(updateContact).length === 0) {
      throw new Error("No valid fields to update");
    }
    const result = await this.contact.findOneAndUpdate(
      filter,
      { $set: updateContact },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    const result = await this.contact.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async findFavorite() {
    return await this.find({ favorite: true });
  }

  async deleteAll() {
    const result = await this.contact.deleteMany({});
    return result.deleteCount;
  }
}

module.exports = ContactService;
