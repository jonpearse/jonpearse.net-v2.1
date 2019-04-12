class Cronlog < ApplicationRecord

  def self.record( worker, start )

    create(
      task_name:  worker.class.to_s.gsub( /Worker$/, '' ),
      started:    start,
      finished:   DateTime.now
    )

  end

  def unread?

    !viewed

  end

  def mark_read!

    update_attribute( :viewed, true )

  end

  def mark_unread!

    update_attribute( :viewed, false )

  end

  def elapsed

    finished - started

  end

end
